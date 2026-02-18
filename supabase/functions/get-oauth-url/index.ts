import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OAuthUrlRequest {
  provider: "gmail" | "outlook";
  origin: string; // The user's current frontend origin
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider, origin }: OAuthUrlRequest = await req.json();

    if (!provider || !origin) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, origin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stable redirect URI — this is the only URI registered in Google/Microsoft console
    const stableRedirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/email-oauth-redirect`;

    // Encode state with provider + origin so the redirect handler knows where to send the user back
    const state = btoa(JSON.stringify({ provider, origin }));

    let oauthUrl: string;

    if (provider === "gmail") {
      const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
      if (!GOOGLE_CLIENT_ID) {
        return new Response(
          JSON.stringify({ error: "Google OAuth not configured. Please add GOOGLE_CLIENT_ID secret." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const scope = encodeURIComponent(
        "https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email"
      );

      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(stableRedirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;
    } else if (provider === "outlook") {
      const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
      if (!MICROSOFT_CLIENT_ID) {
        return new Response(
          JSON.stringify({ error: "Microsoft OAuth not configured. Please add MICROSOFT_CLIENT_ID secret." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const scope = encodeURIComponent(
        "https://graph.microsoft.com/Mail.Send offline_access openid email"
      );

      oauthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(stableRedirectUri)}&response_type=code&scope=${scope}&state=${encodeURIComponent(state)}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid provider. Must be 'gmail' or 'outlook'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: oauthUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Get OAuth URL error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
