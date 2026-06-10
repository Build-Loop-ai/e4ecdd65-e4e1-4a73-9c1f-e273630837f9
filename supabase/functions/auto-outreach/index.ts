import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { leadIds, mode } = await req.json();
    // mode: "auto" (single lead after save) or "bulk" (send to all unsent)

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get outreach settings
    const { data: settings } = await adminClient
      .from("outreach_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mode === "auto" && (!settings || !settings.auto_send_enabled)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Auto-send disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email connection
    const { data: emailConn } = await adminClient
      .from("email_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!emailConn) {
      return new Response(
        JSON.stringify({ error: "No active email connection. Connect your email in Settings first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check deliverability
    if (emailConn.deliverability_score && emailConn.deliverability_score < 50) {
      return new Response(
        JSON.stringify({ error: "Email deliverability too low. Warm up your mailbox first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dailyCap = settings?.daily_cap || 20;

    // Get today's sent count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: sentToday } = await adminClient
      .from("outreach_emails")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("sent_at", todayStart.toISOString());

    const dailyRemaining = Math.max(0, dailyCap - (sentToday || 0));
    if (dailyRemaining === 0) {
      return new Response(
        JSON.stringify({ error: "Daily send cap reached. Try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check monthly email quota from subscription
    const PLAN_LIMITS: Record<string, number> = { free: 10, pro: 100, agency: -1 };
    const { data: subData } = await adminClient
      .from("subscriptions")
      .select("plan, emails_used")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = subData?.plan || "free";
    const emailsUsed = subData?.emails_used || 0;
    const monthlyLimit = PLAN_LIMITS[plan] ?? 10;
    const monthlyRemaining = monthlyLimit === -1 ? Infinity : Math.max(0, monthlyLimit - emailsUsed);

    if (monthlyRemaining === 0) {
      return new Response(
        JSON.stringify({ error: "Monthly email limit reached. Upgrade your plan." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const remaining = Math.min(dailyRemaining, monthlyRemaining === Infinity ? dailyRemaining : monthlyRemaining);


    // Determine which leads to process
    let leadsToProcess: any[];

    if (mode === "bulk") {
      // Find all leads with email + pitch but not yet emailed
      const { data: allLeads } = await adminClient
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .not("email", "is", null)
        .not("preview_id", "is", null);

      // Get already emailed lead IDs
      const { data: emailed } = await adminClient
        .from("outreach_emails")
        .select("lead_id")
        .eq("user_id", user.id);

      const emailedIds = new Set(emailed?.map((e: any) => e.lead_id) || []);
      leadsToProcess = (allLeads || []).filter((l: any) => !emailedIds.has(l.id));
    } else {
      // Auto mode: process specific lead IDs
      const { data } = await adminClient
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .in("id", leadIds || [])
        .not("email", "is", null);

      leadsToProcess = data || [];
    }

    // Cap to remaining daily limit
    leadsToProcess = leadsToProcess.slice(0, remaining);

    if (leadsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No eligible leads to email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get sender profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const results: { leadId: string; success: boolean; error?: string }[] = [];

    for (const lead of leadsToProcess) {
      try {
        // Get preview data if available
        let previewData: any = null;
        let previewUrl = "";
        if (lead.preview_id) {
          const { data: preview } = await adminClient
            .from("client_previews")
            .select("slug, processed_schema, brand_colors")
            .eq("id", lead.preview_id)
            .maybeSingle();

          if (preview) {
            previewData = preview;
            const requestOrigin = req.headers.get("origin");
            const refererUrl = req.headers.get("referer");
            const refererOrigin = refererUrl ? new URL(refererUrl).origin : null;
            const origin = requestOrigin || refererOrigin || Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.lovable.app');
            previewUrl = `${origin}/preview/${preview.slug}`;
          }
        }

        if (!previewUrl) {
          results.push({ leadId: lead.id, success: false, error: "No pitch preview available" });
          continue;
        }

        const schema = previewData?.processed_schema as any;
        const tone = settings?.tone || "professional";

        // Generate AI email copy
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
        const copyRes = await fetch(`${supabaseUrl}/functions/v1/generate-email-copy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Internal service-to-service call — use the service role key so the
            // generate-email-copy auth check recognizes this as a trusted caller.
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            recipientName: lead.business_name,
            businessName: lead.business_name,
            businessType: lead.category || "",
            industry: lead.category || "",
            previewUrl,
            senderName: profile?.full_name || "",
            senderBusiness: profile?.business_name || "",
            language: schema?.language || "",
            services: schema?.services?.map((s: any) => s.title || s.name) || [],
            heroHeadline: schema?.hero?.headline || "",
            heroSubheadline: schema?.hero?.subheadline || "",
            tone,
          }),
        });

        if (!copyRes.ok) {
          results.push({ leadId: lead.id, success: false, error: "Failed to generate email copy" });
          continue;
        }

        const { subject, body } = await copyRes.json();

        // Send the email via send-email function
        const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            to: lead.email,
            subject,
            body,
            recipientName: lead.business_name,
            previewId: lead.preview_id,
            previewUrl,
            leadId: lead.id,
          }),
        });

        if (!sendRes.ok) {
          const errData = await sendRes.json().catch(() => ({}));
          results.push({ leadId: lead.id, success: false, error: errData.error || "Send failed" });
          continue;
        }

        results.push({ leadId: lead.id, success: true });

        // Increment monthly email usage
        await adminClient
          .from("subscriptions")
          .update({ emails_used: emailsUsed + results.filter(r => r.success).length })
          .eq("user_id", user.id);

        // Small delay between sends to protect deliverability
        if (leadsToProcess.indexOf(lead) < leadsToProcess.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (err: any) {
        results.push({ leadId: lead.id, success: false, error: err.message });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({ sent, failed, total: leadsToProcess.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("auto-outreach error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
