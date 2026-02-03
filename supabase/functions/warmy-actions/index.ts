import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WARMY_API_BASE = "https://api.warmy.io";

type WarmyAction = "pause" | "resume" | "test" | "disconnect" | "get_details" | "get_alerts";

interface ActionRequest {
  action: WarmyAction;
  connection_id: string;
  providers?: string[]; // For deliverability test
  domain?: string; // For alerts filter
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WARMY_API_KEY = Deno.env.get("WARMY_API_KEY");
    const WARMY_HOLDER_UID = Deno.env.get("WARMY_HOLDER_UID");

    if (!WARMY_API_KEY || !WARMY_HOLDER_UID) {
      return new Response(
        JSON.stringify({ error: "Warmy API not configured" }),
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

    const { action, connection_id, providers, domain }: ActionRequest = await req.json();

    if (!action || !connection_id) {
      return new Response(
        JSON.stringify({ error: "action and connection_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email connection
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

    if (!connection.warmy_mailbox_id) {
      return new Response(
        JSON.stringify({ error: "This mailbox is not registered with Warmy" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const warmyHeaders = {
      "Authorization": `Bearer ${WARMY_API_KEY}`,
      "Holder-Uid": WARMY_HOLDER_UID,
      "Content-Type": "application/json",
    };

    // Helper to safely parse response (Warmy sometimes returns plain text like "success")
    const safeParseResponse = async (response: Response): Promise<any> => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { message: text, raw: true };
      }
    };

    let warmyResponse: Response;
    let result: any;

    switch (action) {
      case "pause":
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/mailboxes/${connection.warmy_mailbox_id}/update_state`,
          {
            method: "PUT",
            headers: warmyHeaders,
            body: JSON.stringify({ mailbox: { state: "pause!" } }),
          }
        );
        result = await safeParseResponse(warmyResponse);
        
        if (warmyResponse.ok) {
          await adminSupabase
            .from("email_connections")
            .update({ warmy_state: "paused", last_warmy_sync: new Date().toISOString() })
            .eq("id", connection_id);
        }
        break;

      case "resume":
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/mailboxes/${connection.warmy_mailbox_id}/update_state`,
          {
            method: "PUT",
            headers: warmyHeaders,
            body: JSON.stringify({ mailbox: { state: "activate!" } }),
          }
        );
        result = await safeParseResponse(warmyResponse);
        
        if (warmyResponse.ok) {
          await adminSupabase
            .from("email_connections")
            .update({ warmy_state: "active", last_warmy_sync: new Date().toISOString() })
            .eq("id", connection_id);
        }
        break;

      case "test":
        const testProviders = providers || ["GOOGLE", "OUTLOOK", "YAHOO"];
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/mailboxes/${connection.warmy_mailbox_id}/deliverability_checkers`,
          {
            method: "POST",
            headers: warmyHeaders,
            body: JSON.stringify({ providers: testProviders }),
          }
        );
        result = await safeParseResponse(warmyResponse);
        break;

      case "disconnect":
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/mailboxes/${connection.warmy_mailbox_id}`,
          {
            method: "DELETE",
            headers: warmyHeaders,
            body: JSON.stringify({
              reason: {
                reason: "user_requested",
                reason_text: "User disconnected mailbox from Pitch app",
              },
            }),
          }
        );
        result = await safeParseResponse(warmyResponse);
        
        if (warmyResponse.ok) {
          await adminSupabase
            .from("email_connections")
            .update({
              warmy_mailbox_id: null,
              warmy_state: "disconnected",
              deliverability_score: null,
              placement_score: null,
              dns_score: null,
              warmy_temperature: null,
              last_warmy_sync: new Date().toISOString(),
            })
            .eq("id", connection_id);
        }
        break;

      case "get_details":
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/mailboxes/${connection.warmy_mailbox_id}`,
          {
            method: "GET",
            headers: warmyHeaders,
          }
        );
        result = await safeParseResponse(warmyResponse);
        break;

      case "get_alerts":
        const alertDomain = domain || connection.email_address.split("@")[1];
        warmyResponse = await fetch(
          `${WARMY_API_BASE}/api/v2/warmup_alerts?domain=${encodeURIComponent(alertDomain)}`,
          {
            method: "GET",
            headers: warmyHeaders,
          }
        );
        result = await safeParseResponse(warmyResponse);
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (!warmyResponse.ok) {
      console.error(`Warmy ${action} failed:`, result);
      
      // Extract meaningful error message from Warmy response
      let errorMessage = `Failed to ${action}`;
      if (result.errors && Array.isArray(result.errors)) {
        const warmyError = result.errors[0];
        if (warmyError === "not allowed transmission") {
          errorMessage = action === "pause" 
            ? "Cannot pause: mailbox may already be paused or not ready yet"
            : action === "resume"
            ? "Cannot resume: mailbox may already be active or not ready yet"
            : `Action not allowed: ${warmyError}`;
        } else {
          errorMessage = warmyError;
        }
      } else if (result.message) {
        errorMessage = result.message;
      } else if (result.error) {
        errorMessage = result.error;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: warmyResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Warmy action error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
