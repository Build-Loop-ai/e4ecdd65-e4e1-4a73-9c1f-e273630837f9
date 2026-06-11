import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationStatus {
  name: string;
  configured: boolean;
  connected: boolean | null;
  error: string | null;
  secrets: string[];
}

// Presence-only check (never calls the external APIs, never leaks values).
const CHECKS: { name: string; secrets: string[] }[] = [
  { name: "Firecrawl (Site Scanning)", secrets: ["FIRECRAWL_API_KEY"] },
  { name: "Apify (Scraping Fallback)", secrets: ["APIFY_API_KEY"] },
  { name: "Stripe (Payments)", secrets: ["STRIPE_SECRET_KEY"] },
  { name: "Google (Send via Gmail)", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  { name: "Microsoft (Send via Outlook)", secrets: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"] },
  { name: "Warmy (Email Warmup)", secrets: ["WARMY_API_KEY"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results: IntegrationStatus[] = CHECKS.map(({ name, secrets }) => ({
      name,
      configured: secrets.every((s) => !!Deno.env.get(s)),
      connected: null,
      error: null,
      secrets,
    }));

    const configured = results.filter((r) => r.configured).length;
    const total = results.length;

    return new Response(
      JSON.stringify({
        success: true,
        summary: { configured: `${configured}/${total}`, allConfigured: configured === total },
        integrations: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Health check failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
