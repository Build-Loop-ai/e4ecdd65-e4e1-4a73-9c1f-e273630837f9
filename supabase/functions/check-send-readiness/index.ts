import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { connection_id } = await req.json();

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch connection
    const { data: connection, error: connError } = await adminSupabase
      .from("email_connections")
      .select("*")
      .eq("id", connection_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we need to reset daily counter
    const lastReset = connection.last_send_count_reset ? new Date(connection.last_send_count_reset) : new Date(0);
    const today = new Date();
    const isNewDay = lastReset.toDateString() !== today.toDateString();

    if (isNewDay) {
      // Reset counter for new day
      await adminSupabase
        .from("email_connections")
        .update({
          emails_sent_today: 0,
          last_send_count_reset: today.toISOString(),
        })
        .eq("id", connection_id);
      
      connection.emails_sent_today = 0;
    }

    const temperature = connection.warmy_temperature || 0;
    const dailyLimit = connection.daily_send_limit || 5;
    const sentToday = connection.emails_sent_today || 0;
    const deliverabilityScore = connection.deliverability_score;
    
    // Calculate readiness
    const temperatureReady = temperature >= 85;
    const temperatureWarming = temperature >= 60;
    const deliverabilityHealthy = deliverabilityScore === null || deliverabilityScore >= 70;
    const deliverabilityBlocked = deliverabilityScore !== null && deliverabilityScore < 50;
    const remainingToday = Math.max(dailyLimit - sentToday, 0);
    const isPaused = connection.warmy_state === 'paused';

    // Gather warnings
    const warnings: string[] = [];
    
    if (isPaused) {
      warnings.push("Email warmup is paused. Resume warmup to improve deliverability.");
    }
    
    if (!temperatureReady && temperatureWarming) {
      warnings.push(`Mailbox is still warming up (${temperature}°). Limited sending capacity recommended.`);
    } else if (!temperatureReady && !temperatureWarming) {
      warnings.push(`Mailbox is cold (${temperature}°). Very limited sending recommended.`);
    }
    
    if (deliverabilityScore !== null && deliverabilityScore < 70 && deliverabilityScore >= 50) {
      warnings.push(`Deliverability score is low (${deliverabilityScore}%). Consider waiting for warmup to complete.`);
    }
    
    if (remainingToday === 0) {
      warnings.push("Daily sending limit reached. Sending will resume tomorrow.");
    } else if (remainingToday <= 3) {
      warnings.push(`Only ${remainingToday} email${remainingToday !== 1 ? 's' : ''} remaining today.`);
    }

    // Determine if can send
    const canSend = 
      !deliverabilityBlocked && 
      remainingToday > 0 && 
      !isPaused &&
      connection.is_active;

    // Calculate suggested wait time
    let suggestedWaitHours: number | null = null;
    if (remainingToday === 0) {
      // Calculate hours until midnight
      const midnight = new Date(today);
      midnight.setHours(24, 0, 0, 0);
      suggestedWaitHours = Math.ceil((midnight.getTime() - today.getTime()) / (1000 * 60 * 60));
    }

    const result = {
      canSend,
      remainingToday,
      dailyLimit,
      sentToday,
      temperature,
      temperatureReady,
      deliverabilityScore,
      deliverabilityHealthy,
      warnings,
      suggestedWaitHours,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Check send readiness error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
