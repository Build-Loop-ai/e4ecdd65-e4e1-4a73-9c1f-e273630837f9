import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WARMY_API_BASE = "https://api.warmy.io";

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

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optional: filter by user_id if provided in auth header
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabase.auth.getClaims(token);
      userId = claimsData?.claims?.sub || null;
    }

    // Fetch all mailboxes from Warmy
    const warmyResponse = await fetch(`${WARMY_API_BASE}/api/v2/mailboxes`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${WARMY_API_KEY}`,
        "Holder-Uid": WARMY_HOLDER_UID,
        "Content-Type": "application/json",
      },
    });

    if (!warmyResponse.ok) {
      const error = await warmyResponse.text();
      console.error("Warmy API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Warmy mailboxes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const warmyMailboxes = await warmyResponse.json();

    // Get email connections from our database
    let query = adminSupabase
      .from("email_connections")
      .select("id, warmy_mailbox_id, email_address")
      .not("warmy_mailbox_id", "is", null);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: connections, error: connError } = await query;

    if (connError) {
      console.error("Database error:", connError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch connections" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a map of warmy_mailbox_id to warmy data
    const warmyMap = new Map();
    if (Array.isArray(warmyMailboxes)) {
      warmyMailboxes.forEach((mb: any) => {
        warmyMap.set(mb.id, mb);
      });
    } else if (warmyMailboxes.data && Array.isArray(warmyMailboxes.data)) {
      warmyMailboxes.data.forEach((mb: any) => {
        warmyMap.set(mb.id, mb);
      });
    }

    // Update each connection with Warmy data
    const updates: any[] = [];
    for (const conn of connections || []) {
      const warmyData = warmyMap.get(conn.warmy_mailbox_id);
      
      if (warmyData) {
        const updateData = {
          warmy_state: warmyData.state || warmyData.status || "active",
          deliverability_score: warmyData.deliverability_score ?? null,
          placement_score: warmyData.placement_score ?? null,
          dns_score: warmyData.dns_score ?? null,
          warmy_temperature: warmyData.temperature ?? null,
          last_warmy_sync: new Date().toISOString(),
        };

        const { error: updateError } = await adminSupabase
          .from("email_connections")
          .update(updateData)
          .eq("id", conn.id);

        if (updateError) {
          console.error(`Failed to update connection ${conn.id}:`, updateError);
        } else {
          updates.push({ id: conn.id, email: conn.email_address, ...updateData });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: updates.length,
        updated: updates,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Warmy sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
