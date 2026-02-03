
## What’s happening (root cause)
Your Warmy authentication headers are now correct (Bearer token + `Holder-Uid`). The fact you’ve moved from `401` to a `400` strongly suggests Warmy is now accepting your Warmy API credentials, but is rejecting the *mailbox credentials payload*.

For Gmail OAuth mailboxes, Warmy needs OAuth tokens with sufficient Gmail permissions to run warmup (send + read/modify). Right now our Gmail OAuth flow only requests:

- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/userinfo.email`

That’s typically not enough for warmup, because Warmy needs to read incoming mail / move messages / mark as read, etc. When Warmy tries to use the token, Google denies the needed operations, and Warmy surfaces that as the generic:
> “Please recheck your credentials and try again”

So the missing piece is: **our Gmail OAuth scopes are too limited**.  
This won’t be fixed by changing Warmy headers again.

---

## Plan to fix it
### 1) Update the Gmail OAuth scopes we request
In `supabase/functions/get-oauth-url/index.ts`, change the Gmail scope string to request a scope that allows full mailbox access.

Recommended (simplest, most compatible for warmup):
- `https://mail.google.com/` (full Gmail access)

So Gmail scope becomes something like:
- `https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email`

We’ll keep:
- `access_type=offline`
- `prompt=consent`
so you reliably receive a refresh token.

Why this works: Warmy will be able to use the refresh token to obtain access tokens that can actually operate the mailbox the way warmup requires.

### 2) Ensure Warmy “create mailbox” response parsing is correct
Warmy’s doc snippet shows the create mailbox response as:
```json
{ "message": [...], "data": { "id": 123, "tariff_plan_type_id": 1 } }
```
Our `warmy-register` currently assumes `warmyResult.id`.

Even though you’re failing before success right now, after we fix scopes, this would become the next bug. We will update:
- `warmy_mailbox_id` assignment to use `warmyResult.data.id` (with a fallback in case Warmy sometimes returns `id` at top-level).

### 3) Fix Outlook provider string (small correctness fix)
In the OpenAPI discriminator mapping you pasted, Warmy expects:
- `oauth_outlook` (not `oauth_microsoft`)

This doesn’t affect your Gmail issue, but we should correct it to prevent a similar failure for Outlook connections.

### 4) Add targeted logging to confirm the diagnosis (without leaking secrets)
In `warmy-register`, add logs that confirm:
- which provider payload is being sent (`oauth_google`)
- the `expires_at` value
- whether Warmy returns 400 vs 422
- include Warmy response body exactly as returned (we already do, but we’ll ensure it’s not being stringified in a confusing way)

This helps us quickly distinguish:
- “Warmy auth rejected” (would be 401)
vs
- “Warmy couldn’t use Google token” (often 400 with this generic message)
vs
- “Payload validation” (often 422 with field errors)

---

## Required user action after code change (important)
Because OAuth scopes are embedded in the refresh token you received, simply changing code is not enough.

After we update scopes, you must:
1. In the app’s Settings page, disconnect/remove the Gmail connection.
2. Reconnect Gmail (this triggers a new OAuth consent with the new scopes).
3. Then click “Enable Warmup” again.

If you don’t reconnect, Warmy will still receive the old tokens with insufficient permissions and keep failing.

---

## Files we will change
1. `supabase/functions/get-oauth-url/index.ts`
   - Update Gmail OAuth scope to include `https://mail.google.com/`.

2. `supabase/functions/warmy-register/index.ts`
   - Parse Warmy response as `warmyResult.data.id`.
   - Fix Outlook provider string to `oauth_outlook` (and/or adjust payload mapping accordingly).
   - Add a couple of safe debug logs.

(We likely won’t need to change `warmy-actions` / `warmy-sync` again since headers are already aligned with Warmy docs.)

---

## Verification checklist (how we’ll know it’s fixed)
1. Reconnect Gmail from `/dashboard/settings`.
2. Trigger “Enable Warmup”.
3. `warmy-register` returns 200/201 and stores `warmy_mailbox_id` in `email_connections`.
4. Warmy status widgets populate after `warmy-sync` runs (or manual refresh triggers it).

---

## If it still fails after this
Next most likely causes (in order):
1. Google OAuth app is in “Testing” mode and the connected user is not a test user.
2. Refresh token is missing (Google sometimes won’t return it if consent wasn’t forced; we already use `prompt=consent`, but we’ll confirm).
3. `expires_at` format mismatch (Warmy expects ms vs seconds). If needed, we’ll match Warmy schema once we can see the exact expected type from the OpenAPI components (or infer from their error details if they return 422).

