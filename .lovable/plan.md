

## Problem Analysis

The Warmy API returns a generic error `"Please recheck your credentials and try again"`. This is not just about WARMY_API_KEY - the issue is that **Warmy validates multiple credentials**:

1. `WARMY_API_KEY` + `WARMY_HOLDER_UID` (for Warmy authentication)
2. `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (for Gmail OAuth - Warmy needs these to refresh tokens)
3. The `redirect_uri` sent to Warmy (line 117 currently uses `SUPABASE_URL/functions/v1/oauth-callback`)

Your Gmail connection exists with valid tokens, so the OAuth flow worked. But Warmy may be rejecting because:
- The Google credentials passed to Warmy don't match what was used to get the tokens
- The redirect_uri format doesn't match what Warmy expects

## What I Will Change

### 1. Add Better Debug Logging
Update `warmy-register/index.ts` to log the exact payload being sent (without secrets) and the full Warmy response, so we can see what's actually happening.

### 2. Fix the Redirect URI
The current code uses:
```
redirect_uri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/oauth-callback`
```

But this should match the redirect URI used during the Gmail OAuth flow, which is now:
```
${origin}/dashboard/settings?oauth=gmail
```

### 3. Return the Actual Warmy Error
Currently we only return `"Failed to register with Warmy"`. I'll change it to return the actual error message from Warmy so you can see exactly what went wrong.

## Files to Edit

1. **`supabase/functions/warmy-register/index.ts`**
   - Add detailed logging of the request payload (without exposing secrets)
   - Log the full Warmy API response
   - Return the actual Warmy error message to the client
   - Fix the redirect_uri to match what was used in OAuth

## Expected Outcome

After these changes:
- You'll see the exact Warmy error in the browser (not just "Failed to register")
- The Edge Function logs will show the full request/response for debugging
- We can identify whether it's a Warmy credential issue, Google credential issue, or redirect_uri mismatch

