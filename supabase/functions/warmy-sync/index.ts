import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WARMY_API_BASE = "https://api.warmy.io";

// Calculate daily send limit based on temperature
const calculateDailyLimit = (temperature: number): number => {
  if (temperature >= 90) return 50;
  if (temperature >= 80) return 40;
  if (temperature >= 70) return 30;
  if (temperature >= 60) return 20;
  if (temperature >= 50) return 15;
  if (temperature >= 40) return 10;
  if (temperature >= 30) return 8;
  if (temperature >= 20) return 6;
  return 5; // Default minimum
};

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
      .select("id, warmy_mailbox_id, email_address, last_send_count_reset, warmup_started_at")
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
    
    // Handle different response formats from Warmy API
    let mailboxList: any[] = [];
    if (Array.isArray(warmyMailboxes)) {
      mailboxList = warmyMailboxes;
    } else if (warmyMailboxes?.items && Array.isArray(warmyMailboxes.items)) {
      mailboxList = warmyMailboxes.items;
    } else if (warmyMailboxes?.data && Array.isArray(warmyMailboxes.data)) {
      mailboxList = warmyMailboxes.data;
    } else if (warmyMailboxes?.mailboxes && Array.isArray(warmyMailboxes.mailboxes)) {
      mailboxList = warmyMailboxes.mailboxes;
    }

    console.log("Warmy API response type:", typeof warmyMailboxes);
    console.log("Warmy API response keys:", warmyMailboxes ? Object.keys(warmyMailboxes) : "null");
    console.log("Mailbox list length:", mailboxList.length);
    
    mailboxList.forEach((mb: any) => {
      // Warmy uses 'id' as the mailbox identifier
      const mailboxId = mb.id;
      if (mailboxId) {
        warmyMap.set(mailboxId, mb);
        warmyMap.set(String(mailboxId), mb); // Also store as string for flexible matching
      }
    });

    console.log("Warmy map size:", warmyMap.size);
    console.log("DB connections with warmy_mailbox_id:", connections?.length || 0);
    if (connections?.length) {
      console.log("Connection warmy_mailbox_ids:", connections.map(c => c.warmy_mailbox_id));
    }

    // If the list endpoint returns empty, try fetching individual mailboxes
    if (mailboxList.length === 0 && connections && connections.length > 0) {
      console.log("List empty, fetching individual mailboxes...");
      for (const conn of connections) {
        try {
          const singleResponse = await fetch(
            `${WARMY_API_BASE}/api/v2/mailboxes/${conn.warmy_mailbox_id}`,
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${WARMY_API_KEY}`,
                "Holder-Uid": WARMY_HOLDER_UID,
                "Content-Type": "application/json",
              },
            }
          );
          
          if (singleResponse.ok) {
            const mailboxData = await singleResponse.json();
            console.log(`Fetched mailbox ${conn.warmy_mailbox_id}:`, JSON.stringify(mailboxData).substring(0, 200));
            if (mailboxData && (mailboxData.id || mailboxData.mailbox)) {
              const mb = mailboxData.mailbox || mailboxData;
              warmyMap.set(conn.warmy_mailbox_id, mb);
              warmyMap.set(String(conn.warmy_mailbox_id), mb);
            }
          } else {
            console.log(`Failed to fetch mailbox ${conn.warmy_mailbox_id}: ${singleResponse.status}`);
          }
        } catch (e) {
          console.error(`Error fetching mailbox ${conn.warmy_mailbox_id}:`, e);
        }
      }
    }

    // Update each connection with Warmy data
    const updates: any[] = [];
    const now = new Date();
    
    for (const conn of connections || []) {
      // Try both number and string matching
      let warmyData = warmyMap.get(conn.warmy_mailbox_id);
      if (!warmyData) {
        warmyData = warmyMap.get(String(conn.warmy_mailbox_id));
      }
      
      console.log(`Connection ${conn.email_address}: warmy_mailbox_id=${conn.warmy_mailbox_id}, found=${!!warmyData}`);
      
      if (warmyData) {
        // Temperature can be a decimal string like "8.3", round to integer
        const rawTemp = warmyData.temperature ?? warmyData.warmth_level ?? 0;
        const temperature = Math.round(parseFloat(String(rawTemp)) || 0);
        const calculatedLimit = calculateDailyLimit(temperature);
        
        // Parse scores as integers (they might come as decimals too)
        const parseScore = (val: any): number | null => {
          if (val === null || val === undefined) return null;
          const parsed = parseFloat(String(val));
          return isNaN(parsed) ? null : Math.round(parsed);
        };
        
        // Check if we need to reset daily counter
        const lastReset = conn.last_send_count_reset ? new Date(conn.last_send_count_reset) : new Date(0);
        const isNewDay = lastReset.toDateString() !== now.toDateString();
        
        const updateData: any = {
          warmy_state: warmyData.state || warmyData.status || "active",
          deliverability_score: parseScore(warmyData.deliverability_score ?? warmyData.deliverability),
          placement_score: parseScore(warmyData.placement_score),
          dns_score: parseScore(warmyData.dns_score),
          warmy_temperature: temperature,
          daily_send_limit: calculatedLimit,
          last_warmy_sync: now.toISOString(),
        };

        // Reset daily counter if new day
        if (isNewDay) {
          updateData.emails_sent_today = 0;
          updateData.last_send_count_reset = now.toISOString();
        }

        // Set warmup_started_at if not already set
        if (!conn.warmup_started_at && warmyData) {
          updateData.warmup_started_at = now.toISOString();
        }

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
