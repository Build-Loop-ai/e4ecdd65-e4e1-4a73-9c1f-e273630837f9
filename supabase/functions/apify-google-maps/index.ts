import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SearchRequest {
  query: string;
  maxResults?: number;
}

interface ApifyPlace {
  title: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  categoryName?: string;
  totalScore?: number;
  email?: string;
  url?: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const BLOCKED_DOMAINS = new Set([
  'wix.com', 'wordpress.com', 'squarespace.com', 'weebly.com',
  'godaddy.com', 'sentry.io', 'sentry-next.wixpress.com',
  'example.com', 'domain.com', 'email.com', 'test.com',
]);

const BLOCKED_PREFIXES = new Set([
  'noreply', 'no-reply', 'mailer-daemon', 'postmaster',
  'webmaster', 'hostmaster', 'abuse',
]);

function isValidBusinessEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const domain = lower.split('@')[1];
  const prefix = lower.split('@')[0];

  if (!domain || !prefix) return false;
  if (BLOCKED_DOMAINS.has(domain)) return false;
  if (BLOCKED_PREFIXES.has(prefix)) return false;
  // Filter out image-like false positives (e.g. "2x@img.png")
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(domain)) return false;

  return true;
}

async function extractEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PitchBot/1.0)' },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();
    const matches = html.match(EMAIL_REGEX);
    if (!matches) return null;

    // Deduplicate and filter
    const unique = [...new Set(matches)];
    const valid = unique.filter(isValidBusinessEmail);

    // Prefer contact/info emails, then first valid one
    const preferred = valid.find(e => {
      const prefix = e.split('@')[0].toLowerCase();
      return ['info', 'contact', 'hello', 'mail'].includes(prefix);
    });

    return preferred || valid[0] || null;
  } catch {
    return null;
  }
}

// Process in batches with concurrency limit
async function enrichLeadsWithEmails(leads: any[], concurrency = 3): Promise<void> {
  const needsEmail = leads.filter(l => l.website_url && !l.email);
  console.log(`Enriching ${needsEmail.length} leads with email extraction`);

  for (let i = 0; i < needsEmail.length; i += concurrency) {
    const batch = needsEmail.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (lead) => {
        const email = await extractEmailFromWebsite(lead.website_url);
        if (email) {
          lead.email = email;
          console.log(`Found email for ${lead.business_name}: ${email}`);
        }
      })
    );
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY');
    if (!APIFY_API_KEY) {
      throw new Error('APIFY_API_KEY is not configured');
    }

    const { query, maxResults = 20 }: SearchRequest = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Searching for: "${query}" with max ${maxResults} results`);

    // Call Apify Google Maps scraper (synchronous API)
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${APIFY_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchStringsArray: [query],
          maxCrawledPlacesPerSearch: maxResults,
          language: 'en',
          deeperCityScrape: false,
          skipClosedPlaces: true,
        }),
      }
    );

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', apifyResponse.status, errorText);
      throw new Error(`Apify API error: ${apifyResponse.status}`);
    }

    const places: ApifyPlace[] = await apifyResponse.json();
    console.log(`Found ${places.length} places`);

    // Transform the data to our format
    const leads = places.map((place) => ({
      business_name: place.title || 'Unknown Business',
      website_url: place.website || null,
      email: place.email || null,
      phone: place.phone || null,
      address: place.address || null,
      city: place.city || null,
      category: place.categoryName || null,
      rating: place.totalScore || null,
      google_maps_url: place.url || null,
    }));

    // Enrich leads that have websites but no emails
    await enrichLeadsWithEmails(leads);

    const emailCount = leads.filter(l => l.email).length;
    console.log(`${emailCount}/${leads.length} leads have email addresses after enrichment`);

    return new Response(
      JSON.stringify({ success: true, data: leads }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in apify-google-maps function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
