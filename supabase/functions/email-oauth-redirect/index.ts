import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      const errorDesc = url.searchParams.get("error_description") || error;
      return new Response(
        `<html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center"><h2>OAuth Error</h2><p>${errorDesc}</p><p><a href="javascript:window.close()">Close this window</a></p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!code || !stateRaw) {
      return new Response(
        `<html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center"><h2>Invalid Request</h2><p>Missing authorization code or state parameter.</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Decode state: base64url-encoded JSON { provider, origin }
    let state: { provider: string; origin: string };
    try {
      state = JSON.parse(atob(stateRaw));
    } catch {
      return new Response(
        `<html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center"><h2>Invalid State</h2><p>Could not decode state parameter.</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!state.origin || !state.provider) {
      return new Response(
        `<html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center"><h2>Invalid State</h2><p>Missing origin or provider in state.</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Redirect back to the user's frontend with the code
    const redirectUrl = `${state.origin}/dashboard/settings?oauth=${encodeURIComponent(state.provider)}&code=${encodeURIComponent(code)}`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err: any) {
    console.error("email-oauth-redirect error:", err);
    return new Response(
      `<html><body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center"><h2>Something went wrong</h2><p>${err.message || "Unknown error"}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
});
