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
