import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendEmailRequest {
  to: string;
  toName?: string;
  subject: string;
  bodyHtml: string;
  previewId: string;
  leadId?: string;
}

async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !refreshToken) return null;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

async function refreshMicrosoftToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
  const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");

  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !refreshToken) return null;

  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/Mail.Send offline_access",
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

async function sendViaGmail(accessToken: string, to: string, subject: string, bodyHtml: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Create email in RFC 2822 format
  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    bodyHtml,
  ].join("\r\n");

  // Base64url encode (UTF-8 safe — btoa alone fails on non-Latin1 chars)
  const encoder = new TextEncoder();
  const uint8 = encoder.encode(email);
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const encodedEmail = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, error: result.error?.message || "Failed to send via Gmail" };
  }

  return { success: true, messageId: result.id };
}

async function sendViaOutlook(accessToken: string, to: string, subject: string, bodyHtml: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: bodyHtml,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: `Failed to send via Outlook: ${error}` };
  }

  return { success: true, messageId: `outlook-${Date.now()}` };
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

    const { to, toName, subject, bodyHtml, previewId, leadId }: SendEmailRequest = await req.json();

    if (!to || !subject || !bodyHtml || !previewId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, bodyHtml, previewId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's active email connection
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: connection, error: connError } = await adminSupabase
      .from("email_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "No email connection found. Please connect your Gmail or Outlook account in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check deliverability score before sending
    if (connection.deliverability_score !== null && connection.deliverability_score < 50) {
      return new Response(
        JSON.stringify({ 
          error: `Email sending paused due to low deliverability score (${connection.deliverability_score}%). Please wait for warmup to complete or check your email settings.`,
          deliverability_blocked: true,
          score: connection.deliverability_score
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily sending limit
    const now = new Date();
    const lastReset = connection.last_send_count_reset ? new Date(connection.last_send_count_reset) : new Date(0);
    const isNewDay = lastReset.toDateString() !== now.toDateString();
    
    let currentSentToday = connection.emails_sent_today || 0;
    if (isNewDay) {
      currentSentToday = 0;
      // Reset counter
      await adminSupabase
        .from("email_connections")
        .update({
          emails_sent_today: 0,
          last_send_count_reset: now.toISOString(),
        })
        .eq("id", connection.id);
    }

    const dailyLimit = connection.daily_send_limit || 5;
    if (currentSentToday >= dailyLimit) {
      return new Response(
        JSON.stringify({ 
          error: `Daily sending limit reached (${dailyLimit} emails). Sending will resume tomorrow to protect your sender reputation.`,
          daily_limit_reached: true,
          sent_today: currentSentToday,
          daily_limit: dailyLimit
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Warning for low but not critical deliverability
    const deliverabilityWarning = connection.deliverability_score !== null && connection.deliverability_score < 70;

    let accessToken = connection.access_token;

    // Check if token is expired and refresh if needed
    if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
      console.log("Token expired, attempting refresh...");
      
      let refreshResult: { access_token: string; expires_in: number } | null = null;

      if (connection.provider === "gmail") {
        refreshResult = await refreshGoogleToken(connection.refresh_token);
      } else if (connection.provider === "outlook") {
        refreshResult = await refreshMicrosoftToken(connection.refresh_token);
      }

      if (!refreshResult) {
        // Mark connection as inactive and return error
        await adminSupabase
          .from("email_connections")
          .update({ is_active: false })
          .eq("id", connection.id);

        return new Response(
          JSON.stringify({ error: "Email connection expired. Please reconnect your email account in Settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update token in database
      accessToken = refreshResult.access_token;
      await adminSupabase
        .from("email_connections")
        .update({
          access_token: refreshResult.access_token,
          token_expires_at: new Date(Date.now() + refreshResult.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", connection.id);
    }

    // Send email via appropriate provider
    let sendResult: { success: boolean; messageId?: string; error?: string };

    if (connection.provider === "gmail") {
      sendResult = await sendViaGmail(accessToken, to, subject, bodyHtml);
    } else {
      sendResult = await sendViaOutlook(accessToken, to, subject, bodyHtml);
    }

    if (!sendResult.success) {
      return new Response(
        JSON.stringify({ error: sendResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment sent counter
    await adminSupabase
      .from("email_connections")
      .update({
        emails_sent_today: currentSentToday + 1,
        updated_at: now.toISOString(),
      })
      .eq("id", connection.id);

    // Log email in outreach_emails table
    const { error: logError } = await adminSupabase.from("outreach_emails").insert({
      user_id: userId,
      preview_id: previewId,
      lead_id: leadId || null,
      recipient_email: to,
      recipient_name: toName || null,
      subject,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Failed to log email:", logError);
      // Don't fail the request, email was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: sendResult.messageId,
        sentFrom: connection.email_address,
        provider: connection.provider,
        deliverability_warning: deliverabilityWarning,
        deliverability_score: connection.deliverability_score,
        sent_today: currentSentToday + 1,
        daily_limit: dailyLimit,
        remaining_today: dailyLimit - (currentSentToday + 1),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Send email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
