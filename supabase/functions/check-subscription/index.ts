import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAN_LIMITS: Record<string, { pitches: number; emails: number }> = {
  free: { pitches: 3, emails: 10 },
  pro: { pitches: -1, emails: 100 },
  agency: { pitches: -1, emails: -1 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log("[check-subscription] User:", user.email);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get existing subscription record
    const { data: existingSub } = await supabaseClient
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // No Stripe customer — ensure free plan record exists
      const resetData = maybeResetFreeCounters(existingSub);
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan: "free",
          status: "active",
          ...resetData,
        }, { onConflict: "user_id" });

      const sub = { ...existingSub, ...resetData, plan: "free" };
      return respond({
        subscribed: false,
        plan: "free",
        pitches_used: sub?.pitches_used ?? 0,
        emails_used: sub?.emails_used ?? 0,
        limits: PLAN_LIMITS.free,
      });
    }

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Has Stripe customer but no active subscription → free
      const resetData = maybeResetFreeCounters(existingSub);
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: "free",
          status: "active",
          ...resetData,
        }, { onConflict: "user_id" });

      const sub = { ...existingSub, ...resetData, plan: "free" };
      return respond({
        subscribed: false,
        plan: "free",
        pitches_used: sub?.pitches_used ?? 0,
        emails_used: sub?.emails_used ?? 0,
        limits: PLAN_LIMITS.free,
      });
    }

    // Active subscription found
    const stripeSub = subscriptions.data[0];
    const priceId = stripeSub.items.data[0].price.id;
    const productId = stripeSub.items.data[0].price.product as string;

    let plan = "pro"; // default for unknown paid plans
    if (priceId === "price_1T02MsGs528xYuUTgi30NI8t") plan = "pro";
    else if (priceId === "price_1T02MtGs528xYuUTn83xi3Le") plan = "agency";

    // Parse period dates safely
    let periodEnd: string | null = null;
    let periodStart: string | null = null;
    try {
      if (stripeSub.current_period_end) {
        const ts = typeof stripeSub.current_period_end === "number"
          ? stripeSub.current_period_end * 1000
          : new Date(stripeSub.current_period_end).getTime();
        periodEnd = new Date(ts).toISOString();
      }
      if (stripeSub.current_period_start) {
        const ts = typeof stripeSub.current_period_start === "number"
          ? stripeSub.current_period_start * 1000
          : new Date(stripeSub.current_period_start).getTime();
        periodStart = new Date(ts).toISOString();
      }
    } catch (e) {
      console.warn("[check-subscription] Date parse error:", e);
    }

    // Check if billing period rolled over → reset counters
    let pitchesUsed = existingSub?.pitches_used ?? 0;
    let emailsUsed = existingSub?.emails_used ?? 0;

    if (periodStart && existingSub?.current_period_start) {
      const newStart = new Date(periodStart).getTime();
      const oldStart = new Date(existingSub.current_period_start).getTime();
      if (newStart > oldStart) {
        // New billing period — reset usage
        pitchesUsed = 0;
        emailsUsed = 0;
        console.log("[check-subscription] Billing period rolled over, resetting counters");
      }
    }

    await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSub.id,
        plan,
        status: "active",
        pitches_used: pitchesUsed,
        emails_used: emailsUsed,
        ...(periodStart && { current_period_start: periodStart }),
        ...(periodEnd && { current_period_end: periodEnd }),
      }, { onConflict: "user_id" });

    return respond({
      subscribed: true,
      plan,
      product_id: productId,
      subscription_end: periodEnd,
      pitches_used: pitchesUsed,
      emails_used: emailsUsed,
      limits: PLAN_LIMITS[plan] || PLAN_LIMITS.pro,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[check-subscription] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function respond(data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

/** For free users, reset counters on the 1st of each month */
function maybeResetFreeCounters(existingSub: any) {
  if (!existingSub) return { pitches_used: 0, emails_used: 0 };

  const now = new Date();
  const lastReset = existingSub.current_period_start
    ? new Date(existingSub.current_period_start)
    : null;

  // Reset if no period recorded or if we're in a new month
  if (
    !lastReset ||
    now.getFullYear() > lastReset.getFullYear() ||
    now.getMonth() > lastReset.getMonth()
  ) {
    return {
      pitches_used: 0,
      emails_used: 0,
      current_period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    };
  }

  return {
    pitches_used: existingSub.pitches_used ?? 0,
    emails_used: existingSub.emails_used ?? 0,
  };
}
