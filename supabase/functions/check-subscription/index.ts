import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    console.log("[check-subscription] Customers found:", customers.data.length);

    if (customers.data.length === 0) {
      await supabaseClient
        .from("subscriptions")
        .upsert({ user_id: user.id, plan: "free", status: "active" }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("[check-subscription] Customer ID:", customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    console.log("[check-subscription] Active subs:", subscriptions.data.length);

    if (subscriptions.data.length === 0) {
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan: "free",
          status: "active",
        }, { onConflict: "user_id" });

      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0].price.id;
    const productId = sub.items.data[0].price.product as string;

    let plan = "free";
    if (priceId === "price_1T02MsGs528xYuUTgi30NI8t") plan = "pro";
    else if (priceId === "price_1T02MtGs528xYuUTn83xi3Le") plan = "agency";

    // Safely handle period dates
    let periodEnd: string | null = null;
    let periodStart: string | null = null;
    try {
      if (sub.current_period_end) {
        const endTs = typeof sub.current_period_end === 'number' 
          ? sub.current_period_end * 1000 
          : new Date(sub.current_period_end).getTime();
        periodEnd = new Date(endTs).toISOString();
      }
      if (sub.current_period_start) {
        const startTs = typeof sub.current_period_start === 'number'
          ? sub.current_period_start * 1000
          : new Date(sub.current_period_start).getTime();
        periodStart = new Date(startTs).toISOString();
      }
    } catch (e) {
      console.warn("[check-subscription] Date parse error:", e);
    }

    await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        plan,
        status: "active",
        ...(periodStart && { current_period_start: periodStart }),
        ...(periodEnd && { current_period_end: periodEnd }),
      }, { onConflict: "user_id" });

    return new Response(JSON.stringify({
      subscribed: true,
      plan,
      product_id: productId,
      subscription_end: periodEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
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
