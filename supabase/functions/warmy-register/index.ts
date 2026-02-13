import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WARMY_API_BASE = "https://api.warmy.io";

interface RegisterRequest {
  connection_id: string;
  from_name?: string;
  speed_mode?: "slow" | "medium" | "fast";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WARMY_API_KEY = Deno.env.get("WARMY_API_KEY");
    const WARMY_HOLDER_UID = Deno.env.get("WARMY_HOLDER_UID");
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!WARMY_API_KEY || !WARMY_HOLDER_UID) {
      return new Response(
        JSON.stringify({ error: "Warmy API not configured. Missing WARMY_API_KEY or WARMY_HOLDER_UID." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user authentication
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

    const { connection_id, from_name, speed_mode = "medium" }: RegisterRequest = await req.json();

    if (!connection_id) {
      return new Response(
        JSON.stringify({ error: "connection_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email connection with tokens
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: connection, error: connError } = await adminSupabase
      .from("email_connections")
      .select("*")
      .eq("id", connection_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Email connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (connection.warmy_mailbox_id) {
      return new Response(
        JSON.stringify({ error: "This mailbox is already registered with Warmy" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use request origin for dynamic redirect_uri (works from any domain)
    const requestOrigin = req.headers.get("origin");
    const refererUrl = req.headers.get("referer");
    const refererOrigin = refererUrl ? new URL(refererUrl).origin : null;
    const appOrigin = requestOrigin || refererOrigin || Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.lovable.app');
    
    console.log("Using origin for redirect_uri:", appOrigin);
    
    // Build Warmy registration payload
    let mailboxPayload: any;

    if (connection.provider === "gmail") {
      // Calculate token expiry timestamp
      const expiresAt = connection.token_expires_at 
        ? Math.floor(new Date(connection.token_expires_at).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 3600;

      // Use the same redirect_uri that was used during OAuth
      const redirectUri = `${appOrigin}/dashboard/settings?oauth=gmail`;

      mailboxPayload = {
        mailbox: {
          email: connection.email_address,
          provider: "oauth_google",
          from_name: from_name || connection.email_address.split("@")[0],
          tariff_plan_type_id: 1,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
          expires_at: expiresAt,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          token_credential_uri: "https://oauth2.googleapis.com/token",
          setting_attributes: {
            speed_mode: speed_mode,
          },
        },
      };

      // Log payload structure for debugging (without secrets)
      console.log("Warmy Gmail registration - payload structure:", {
        email: connection.email_address,
        provider: "oauth_google",
        from_name: mailboxPayload.mailbox.from_name,
        expires_at: expiresAt,
        redirect_uri: redirectUri,
        has_access_token: !!connection.access_token,
        has_refresh_token: !!connection.refresh_token,
        has_client_id: !!GOOGLE_CLIENT_ID,
        has_client_secret: !!GOOGLE_CLIENT_SECRET,
      });
    } else if (connection.provider === "outlook") {
      // Outlook OAuth registration
      const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
      const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");
      
      const expiresAt = connection.token_expires_at 
        ? Math.floor(new Date(connection.token_expires_at).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 3600;

      const redirectUri = `${appOrigin}/dashboard/settings?oauth=outlook`;

      mailboxPayload = {
        mailbox: {
          email: connection.email_address,
          provider: "oauth_outlook",
          from_name: from_name || connection.email_address.split("@")[0],
          tariff_plan_type_id: 1,
          access_token: connection.access_token,
          refresh_token: connection.refresh_token,
          expires_at: expiresAt,
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri: redirectUri,
          setting_attributes: {
            speed_mode: speed_mode,
          },
        },
      };

      console.log("Warmy Outlook registration - payload structure:", {
        email: connection.email_address,
        provider: "oauth_outlook",
        from_name: mailboxPayload.mailbox.from_name,
        expires_at: expiresAt,
        redirect_uri: redirectUri,
        has_access_token: !!connection.access_token,
        has_refresh_token: !!connection.refresh_token,
        has_client_id: !!MICROSOFT_CLIENT_ID,
        has_client_secret: !!MICROSOFT_CLIENT_SECRET,
      });
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${connection.provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending request to Warmy API...");

    // Register with Warmy API using Bearer token authentication
    const warmyResponse = await fetch(`${WARMY_API_BASE}/api/v2/mailboxes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WARMY_API_KEY}`,
        "Holder-Uid": WARMY_HOLDER_UID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailboxPayload),
    });

    const warmyResult = await warmyResponse.json();
    
    // Log full Warmy response for debugging
    console.log("Warmy API response:", {
      status: warmyResponse.status,
      statusText: warmyResponse.statusText,
      result: warmyResult,
    });

    if (!warmyResponse.ok) {
      // Extract detailed error message from Warmy response
      let errorMessage = "Unknown Warmy error";
      
      if (warmyResult.message) {
        errorMessage = warmyResult.message;
      } else if (warmyResult.error) {
        errorMessage = typeof warmyResult.error === 'string' ? warmyResult.error : JSON.stringify(warmyResult.error);
      } else if (warmyResult.errors) {
        errorMessage = Array.isArray(warmyResult.errors) ? warmyResult.errors.join(", ") : JSON.stringify(warmyResult.errors);
      } else {
        errorMessage = JSON.stringify(warmyResult);
      }
      
      console.error("Warmy registration failed:", { 
        status: warmyResponse.status, 
        error: errorMessage,
        fullResponse: warmyResult 
      });
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: warmyResult,
        }),
        { status: warmyResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse Warmy response - API v2 returns { data: { id: ... } }
    const warmyMailboxId = warmyResult.data?.id ?? warmyResult.id;
    
    console.log("Warmy registration successful - mailbox ID:", warmyMailboxId);

    // Update email connection with Warmy data
    const { error: updateError } = await adminSupabase
      .from("email_connections")
      .update({
        warmy_mailbox_id: warmyMailboxId,
        warmy_state: "paused", // Warmy starts new mailboxes in paused state
        last_warmy_sync: new Date().toISOString(),
      })
      .eq("id", connection_id);

    if (updateError) {
      console.error("Failed to update connection with Warmy ID:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        warmy_mailbox_id: warmyMailboxId,
        message: "Email warmup enabled successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Warmy register error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
