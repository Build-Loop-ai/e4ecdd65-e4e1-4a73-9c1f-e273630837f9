
## What’s actually happening (root cause)
The “Failed to send a request to the Edge Function” on **Analyze Website** is coming from the **process-content** backend function call (not the scrape call).

Your frontend calls:
- `firecrawl-scrape` via custom `fetch` (works; network shows 200)
- then calls `process-content` via `supabase.functions.invoke(...)` (fails with “Failed to fetch”)

When `supabase.functions.invoke` runs in the browser, it automatically sends extra headers like:
- `x-client-info`
- `x-supabase-client-platform`

But your backend function CORS currently allows only:
`authorization, x-client-info, apikey, content-type`

So the browser’s CORS preflight fails (because `x-supabase-client-platform` isn’t allowed), and the browser reports it as a generic network error (“Failed to fetch”), which Supabase surfaces as “Failed to send a request to the Edge Function”.

This also explains why:
- backend logs show only “booted” and nothing else (the function never actually runs)
- calling the function server-to-server (my curl test) works fine

---

## Implementation plan (what I will change)

### 1) Fix CORS headers for `process-content`
Update `supabase/functions/process-content/index.ts`:

- Expand `corsHeaders['Access-Control-Allow-Headers']` to include:
  - `x-supabase-client-platform`
  - (optionally) `x-supabase-client-version` if present in some clients
- Keep OPTIONS preflight handling as-is.

Target header string:
- `authorization, x-client-info, apikey, content-type, x-supabase-client-platform`

### 2) (Optional but recommended) Align CORS headers across all backend functions
Update `firecrawl-scrape` too to use the same broader allow-list, so future calls (or future usage of `supabase.functions.invoke` there) won’t hit the same issue.

### 3) Add minimal request logging to `process-content`
Add a couple of safe logs:
- “process-content started”
- payload sizes (e.g., length of markdown) — not the full content
This makes future debugging much faster without leaking user data.

### 4) Verify end-to-end from the UI
After changes land, I’ll validate the full flow:
1. Open `/new-preview`
2. Run Analyze on a known URL
3. Confirm:
   - scrape step succeeds
   - processing step succeeds
   - template selection appears

### 5) Improve error messaging (small UX tweak)
If the backend call fails again for any other reason, update the toast to include:
- which step failed (Scrape vs AI Processing)
- the actionable hint if it’s a CORS/network issue

---

## Files that will be modified
- `supabase/functions/process-content/index.ts` (required)
- `supabase/functions/firecrawl-scrape/index.ts` (optional but recommended)
- `src/pages/NewPreview.tsx` (optional UX improvement only)

---

## Expected result after fix
Clicking **Analyze Website** should reliably proceed past “Processing Content with AI…” and reach **Choose a Template** without the red error toast.

---

## Risks / edge cases
- If the scraped HTML is extremely large, processing might still be slow; but that would produce a *different* error pattern (timeouts or 500s) and the function logs would show it. The current issue is almost certainly CORS/preflight because the request never reaches the function handler.
