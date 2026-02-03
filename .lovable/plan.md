
## Why you still get `redirect_uri_mismatch`
Right now the app is generating the Google OAuth redirect URI using the **wrong path** in two places:

- `src/hooks/useEmailConnections.ts` uses:
  - `${window.location.origin}/settings?oauth=gmail`
- `src/pages/Settings.tsx` (OAuth callback exchange) also uses:
  - `${window.location.origin}/settings?oauth=gmail`

But your actual Settings page route is **`/dashboard/settings`** (as confirmed by your Google error details and by `App.tsx`).

So Google receives a redirect_uri like:
- `https://website4u.lovable.app/dashboard/settings?oauth=gmail`

…while your Google OAuth client currently has redirect URIs like:
- `https://website4u.lovable.app/settings?oauth=gmail`
- `https://id-preview--...lovable.app` (missing the `/dashboard/settings?...` path)

Google requires the redirect URI to match **exactly** (scheme + domain + path + query), so it blocks with error 400.

---

## What I will change in the app (code fixes)
### A) Fix redirect URI generation everywhere
1. Update `src/hooks/useEmailConnections.ts`
   - Change both:
     - `redirectUri = ${origin}/settings?oauth=${provider}`
   - to:
     - `redirectUri = ${origin}/dashboard/settings?oauth=${provider}`

2. Update `src/pages/Settings.tsx`
   - Change:
     - `redirectUri = ${origin}/settings?oauth=${oauthProvider}`
   - to:
     - `redirectUri = ${origin}/dashboard/settings?oauth=${oauthProvider}`

3. (Optional but recommended) Add one shared helper function (to avoid future mismatch):
   - Example: `getEmailOAuthRedirectUri(provider)` used in both files
   - Ensures we never accidentally drift between `/settings` and `/dashboard/settings` again.

### B) Add a legacy redirect route (nice-to-have)
To prevent old links from breaking (and to match what you already added in Google Console), add a route:
- `/settings` → redirects to `/dashboard/settings`

This does not “fix” OAuth by itself, but it prevents confusion and broken navigation.

---

## What you must change in Google Cloud Console (configuration fixes)
You must add the **exact redirect URIs** for every environment you test on.

### 1) Published domain
Add this to “Authorized redirect URIs”:
- `https://website4u.lovable.app/dashboard/settings?oauth=gmail`

### 2) Preview domain (lovable.app preview)
Add:
- `https://id-preview--71e14fb3-a780-45e5-af36-d44386990efc.lovable.app/dashboard/settings?oauth=gmail`

### 3) Preview domain (lovableproject.com, you’re hitting this too)
From your stack trace, you also run on `...lovableproject.com`, so add:
- `https://id-preview--71e14fb3-a780-45e5-af36-d44386990efc.lovableproject.com/dashboard/settings?oauth=gmail`

### 4) If you have a custom domain
Also add:
- `https://YOURDOMAIN.COM/dashboard/settings?oauth=gmail`
(and if you use www)
- `https://www.YOURDOMAIN.COM/dashboard/settings?oauth=gmail`

Important: **Keep** your “Authorized JavaScript origins” as origins only (no path). That part in your screenshot looks fine.

---

## Verification checklist (end-to-end)
1. Clear cookies for accounts.google.com (or try in an incognito window).
2. From each environment (published + preview + custom), click “Connect Gmail”.
3. Confirm Google now accepts the redirect and returns you to:
   - `/dashboard/settings?oauth=gmail&code=...`
4. Confirm our app successfully exchanges the code (toast success) and your mailbox appears connected.
5. Confirm no repeated callback processing (your `oauthProcessed` guard continues to prevent double-processing).

---

## Follow-up improvements (after OAuth works)
1. Update Warmy registration flow to run only after the Gmail connection is confirmed.
2. In Settings, show a clearer “Warmup not enabled yet” state when `warmy_mailbox_id` is null.
3. Add a small debug panel (dev-only) that prints the exact redirect URI the app is using, to avoid future confusion.

---

## Files I will edit (implementation)
- `src/hooks/useEmailConnections.ts` (fix redirectUri path)
- `src/pages/Settings.tsx` (fix redirectUri path used in callback exchange)
- `src/App.tsx` (optional: add `/settings` → `/dashboard/settings` redirect)
- (Optional) `src/lib/...` new helper for redirect URI construction

---

## Expected outcome
After these code + Google Console updates:
- Google OAuth will stop throwing `Error 400: redirect_uri_mismatch`
- Gmail connection will complete successfully on **all** environments (published, preview, and custom domain), as long as each domain’s exact redirect URI is registered.
