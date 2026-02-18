import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OAuthCallbackRequest {
  provider: "gmail" | "outlook";
  code: string;
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
    const userId = claimsData.claims.sub;

    const { provider, code }: OAuthCallbackRequest = await req.json();

    if (!provider || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: provider, code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The redirect_uri used during token exchange MUST match the one used in the authorization request
    const redirect_uri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/email-oauth-redirect`;

    let tokenResponse: any;
    let emailAddress: string;

    if (provider === "gmail") {
      const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
      const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: "Google OAuth not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri,
          grant_type: "authorization_code",
        }),
      });

      tokenResponse = await tokenRes.json();

      if (tokenResponse.error) {
        console.error("Google OAuth error:", tokenResponse);
        return new Response(
          JSON.stringify({ error: `Google OAuth failed: ${tokenResponse.error_description || tokenResponse.error}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();
      emailAddress = userInfo.email;

    } else if (provider === "outlook") {
      const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
      const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");

      if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: "Microsoft OAuth not configured. Please add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET secrets." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri,
          grant_type: "authorization_code",
          scope: "https://graph.microsoft.com/Mail.Send offline_access",
        }),
      });

      tokenResponse = await tokenRes.json();

      if (tokenResponse.error) {
        console.error("Microsoft OAuth error:", tokenResponse);
        return new Response(
          JSON.stringify({ error: `Microsoft OAuth failed: ${tokenResponse.error_description || tokenResponse.error}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userInfoRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();
      emailAddress = userInfo.mail || userInfo.userPrincipalName;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid provider. Must be 'gmail' or 'outlook'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : null;

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertError } = await adminSupabase
      .from("email_connections")
      .upsert(
        {
          user_id: userId,
          provider,
          email_address: emailAddress,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || null,
          token_expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("Database error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save connection" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, email: emailAddress, provider }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
