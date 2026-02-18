

# Fix Gmail OAuth `redirect_uri_mismatch` for All Domains

## The Problem

Google OAuth requires the `redirect_uri` to **exactly match** a URI registered in Google Cloud Console. Right now, the redirect URI is built dynamically from `window.location.origin` (e.g., `https://preview--e4ecdd65-....lovable.app/dashboard/settings?oauth=gmail`). This means:

- Every new domain (preview, published, custom domain, remixed project) needs to be manually registered in Google Cloud Console
- Remixed projects will **always** fail because they have a completely different domain

## The Solution

Create a new **backend redirect handler** (`email-oauth-redirect`) with a **stable URL** that never changes, regardless of which frontend domain the user is on. Only this one URL needs to be registered in Google Cloud Console.

### New Flow

```text
1. User clicks "Connect Gmail"
2. Frontend calls get-oauth-url, passing their current origin
3. get-oauth-url builds the Google auth URL with:
   - redirect_uri = stable edge function URL (email-oauth-redirect)
   - state = JSON containing { provider, origin } (so we know where to send the user back)
4. Google redirects to the stable edge function URL with code + state
5. Edge function reads the origin from state, redirects the browser to:
   {origin}/dashboard/settings?oauth=gmail&code={code}
6. Frontend Settings page picks up the code and exchanges it (as it does today)
```

The key insight: the `redirect_uri` registered with Google is always the same edge function URL, but the user gets redirected back to whatever frontend they came from.

## Changes

### 1. New Edge Function: `supabase/functions/email-oauth-redirect/index.ts`

A simple GET handler that Google redirects to. It:
- Reads `code` and `state` from query params
- Decodes `state` to get `{ provider, origin }`
- Sends a 302 redirect to `{origin}/dashboard/settings?oauth={provider}&code={code}`
- On error, shows a simple error page

No auth needed -- this is just a redirect passthrough. The actual token exchange (which needs auth) still happens in `oauth-callback`.

### 2. Update `get-oauth-url` Edge Function

- Stop accepting `redirect_uri` from the frontend
- Instead, accept `origin` (the user's current domain)
- Build the stable redirect URI: `{SUPABASE_URL}/functions/v1/email-oauth-redirect`
- Pack `{ provider, origin }` into the Google OAuth `state` parameter
- Use the stable redirect URI in the Google/Microsoft auth URL

### 3. Update `oauth-callback` Edge Function

- Change the `redirect_uri` it sends to Google's token endpoint to use the same stable edge function URL
- This must match exactly what was used in the authorization request

### 4. Update Frontend (`oauthRedirect.ts`, `useEmailConnections.ts`)

- `getEmailOAuthRedirectUri` is no longer needed for the Google redirect -- remove or repurpose
- `useEmailConnections.ts` `getOAuthUrl`: pass `origin: window.location.origin` instead of `redirect_uri`
- `useEmailConnections.ts` `handleOAuthCallback`: pass the stable edge function URL as `redirect_uri` (needed for token exchange)
- Settings.tsx callback handler: pass the stable redirect URI when calling `oauth-callback`

### 5. Google Cloud Console (manual step for you)

Register ONE redirect URI:
`https://wylrvlvphndooigebwrg.supabase.co/functions/v1/email-oauth-redirect`

This single URI works for all domains -- preview, published, custom domains, and remixed projects.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/email-oauth-redirect/index.ts` | **New** -- redirect handler |
| `supabase/functions/get-oauth-url/index.ts` | Use stable redirect URI + state param |
| `supabase/functions/oauth-callback/index.ts` | Use stable redirect URI for token exchange |
| `src/lib/oauthRedirect.ts` | Update to return the stable edge function URL |
| `src/hooks/useEmailConnections.ts` | Pass origin instead of redirect_uri to get-oauth-url |
| `src/pages/Settings.tsx` | Use stable redirect URI in callback handler |

## After Approving

You will need to update your Google Cloud Console authorized redirect URIs to include the new stable URL. I will provide the exact URL after implementation.

