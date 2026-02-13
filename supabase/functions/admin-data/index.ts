import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller's identity using anon client
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all platform data using service role (bypasses RLS)
    const [
      usersRes,
      pitchesRes,
      visitsRes,
      leadsRes,
      emailsRes,
      feedbackRes,
      connectionsRes,
      demoLeadsRes,
    ] = await Promise.all([
      adminClient.auth.admin.listUsers({ perPage: 1000 }),
      adminClient.from("client_previews").select("*").order("created_at", { ascending: false }),
      adminClient.from("preview_visits").select("*").order("visited_at", { ascending: false }).limit(500),
      adminClient.from("leads").select("*").order("created_at", { ascending: false }),
      adminClient.from("outreach_emails").select("*").order("sent_at", { ascending: false }),
      adminClient.from("client_feedback").select("*").order("created_at", { ascending: false }),
      adminClient.from("email_connections").select("*"),
      adminClient.from("demo_leads").select("*").order("created_at", { ascending: false }),
    ]);

    const users = usersRes.data?.users ?? [];
    const pitches = pitchesRes.data ?? [];
    const visits = visitsRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const emails = emailsRes.data ?? [];
    const feedback = feedbackRes.data ?? [];
    const connections = connectionsRes.data ?? [];
    const demoLeads = demoLeadsRes.data ?? [];

    // Compute KPIs
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentVisits = visits.filter((v: any) => new Date(v.visited_at) >= sevenDaysAgo);

    const kpis = {
      totalUsers: users.length,
      totalPitches: pitches.length,
      pitchesByStatus: {
        draft: pitches.filter((p: any) => p.status === "draft").length,
        sent: pitches.filter((p: any) => p.status === "sent").length,
        feedback_received: pitches.filter((p: any) => p.status === "feedback_received").length,
      },
      totalViews: visits.length,
      viewsLast7Days: recentVisits.length,
      totalLeads: leads.length,
      totalEmailsSent: emails.length,
      totalFeedback: feedback.length,
      totalDemoLeads: demoLeads.length,
    };

    // Build users table data
    const usersTable = users.map((u: any) => {
      const userPitches = pitches.filter((p: any) => p.user_id === u.id);
      const userLeads = leads.filter((l: any) => l.user_id === u.id);
      const userEmails = emails.filter((e: any) => e.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        pitchCount: userPitches.length,
        leadCount: userLeads.length,
        emailCount: userEmails.length,
      };
    });

    // Build pitches table with owner email
    const pitchesTable = pitches.map((p: any) => {
      const owner = users.find((u: any) => u.id === p.user_id);
      const viewCount = visits.filter((v: any) => v.preview_id === p.id).length;
      return {
        id: p.id,
        client_name: p.client_name,
        owner_email: owner?.email ?? "Unknown",
        status: p.status,
        views: viewCount,
        created_at: p.created_at,
        slug: p.slug,
      };
    });

    // Recent activity (last 50 events)
    const activity: any[] = [];
    visits.slice(0, 30).forEach((v: any) => {
      activity.push({ type: "visit", timestamp: v.visited_at, preview_id: v.preview_id, device: v.device_type, country: v.country });
    });
    feedback.slice(0, 20).forEach((f: any) => {
      activity.push({ type: "feedback", timestamp: f.created_at, preview_id: f.preview_id, client_name: f.client_name });
    });
    emails.slice(0, 20).forEach((e: any) => {
      activity.push({ type: "email", timestamp: e.sent_at, recipient: e.recipient_email, subject: e.subject });
    });
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Email health
    const emailHealth = connections.map((c: any) => ({
      email: c.email_address,
      provider: c.provider,
      warmy_state: c.warmy_state,
      temperature: c.warmy_temperature,
      deliverability: c.deliverability_score,
      dns_score: c.dns_score,
      daily_limit: c.daily_send_limit,
      sent_today: c.emails_sent_today,
      is_active: c.is_active,
    }));

    return new Response(
      JSON.stringify({ kpis, usersTable, pitchesTable, activity: activity.slice(0, 50), emailHealth, demoLeads }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
