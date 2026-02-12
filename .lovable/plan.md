

# Production Readiness Audit -- Issues Found and Fixes

After a thorough investigation of the codebase, database, and edge functions, here are the issues that need to be fixed to make the system production-ready.

---

## Issue 1: Demo/Mock Warmy Data Causes Crashes (CRITICAL)

**Problem:** The `useWarmyStatus` hook (line 306) injects a fake `demoConnection` with `id: 'demo-warmy-1'` and `warmy_mailbox_id: 99999` when the user has no real Warmy connections. This demo card renders fully interactive buttons (Pause, Resume, Test, Disconnect, View Details, Sync Scores, Run Test) that all call real edge functions with the fake ID `demo-warmy-1`.

When a user clicks **any** of these buttons:
- `pauseWarmup('demo-warmy-1')` calls `warmy-actions` which queries `email_connections` for a row with `id = 'demo-warmy-1'` -- returns nothing, throws a 404 error toast.
- `syncScores()` calls `warmy-sync` which tries to sync real connections -- if none exist, it may error or silently succeed doing nothing.
- `runDeliverabilityTest('demo-warmy-1')` -- same 404 crash.
- The `EmailReadinessCard` on the dashboard also uses this demo data and has a "Run Test" button that will fail.

**Also:** The `connectionsNeedingAttention` array includes the demo connection (deliverability 72 < 70 threshold), showing a false "needs attention" alert banner.

**Fix:** Remove the demo data fallback entirely. The warmup section should show a proper empty state when no real Warmy connections exist, which it already does in the `WarmySection` component (the "No warmup active" message). The demo data bypasses this empty state.

---

## Issue 2: `check-send-readiness` Edge Function Missing from Config (MODERATE)

**Problem:** The `check-send-readiness` edge function exists in `supabase/functions/check-send-readiness/index.ts` and is called by the `SendHealthCheck` component, but it is **not listed** in `supabase/config.toml`. Without `verify_jwt = false`, the default JWT verification (which doesn't work with signing-keys) will reject all requests.

This means the Send Health Check panel in the Send Email Dialog silently fails or shows an error for any user with a Warmy-connected mailbox.

**Fix:** Add `[functions.check-send-readiness]` with `verify_jwt = false` to `supabase/config.toml`.

---

## Issue 3: EmailConnectionCard Claims "We Never Read Your Inbox" (MINOR/MISLEADING)

**Problem:** The `EmailConnectionCard` component (line 269) says: *"We request minimal permissions (send-only) and never read your inbox."* But the actual OAuth scope is `https://mail.google.com/` (full mailbox access), which is intentionally required for Warmy warmup. This is misleading to users.

**Fix:** Update the disclaimer text to accurately reflect the permissions: explain that full access is needed for the warmup service to work, and that their credentials are used securely.

---

## Issue 4: Dashboard Layout Removed Important Widgets (MODERATE)

**Problem:** A previous edit removed `EmailHealthWidget` and the sidebar layout from the Dashboard. The dashboard now only shows `StatsCards` and `EmailReadinessCard` stacked in a single column. The `EmailHealthWidget` component still exists but is no longer imported or rendered.

However, `EmailReadinessCard` serves a similar purpose and is present, so this is more of a layout/UX concern. The single-column layout with no sidebar wastes horizontal space on desktop.

**Fix:** Restore a proper grid layout so the dashboard uses available horizontal space better (e.g., stats cards spanning full width, readiness card in a sidebar or secondary column).

---

## Summary of Changes

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | Remove demo Warmy data that causes action button crashes | Critical | `src/hooks/useWarmyStatus.ts` |
| 2 | Add `check-send-readiness` to config.toml | Moderate | `supabase/config.toml` |
| 3 | Fix misleading "send-only" permissions text | Minor | `src/components/email/EmailConnectionCard.tsx` |
| 4 | Restore dashboard grid layout | Moderate | `src/pages/Dashboard.tsx` |

---

## Technical Details

### Change 1: `src/hooks/useWarmyStatus.ts`
- Remove the `demoConnection` object (lines 288-304)
- Change line 306 from `const warmyConnections = realWarmyConnections.length > 0 ? realWarmyConnections : [demoConnection];` to simply `const warmyConnections = realWarmyConnections;`
- This restores the proper empty state behavior

### Change 2: `supabase/config.toml`
- Add:
```text
[functions.check-send-readiness]
verify_jwt = false
```

### Change 3: `src/components/email/EmailConnectionCard.tsx`
- Update the disclaimer text at the bottom to say something like: "Your email credentials are securely stored. Full mailbox access is required for the warmup service to function properly."

### Change 4: `src/pages/Dashboard.tsx`
- Restore a 2-column grid layout on large screens: stats cards in the main column, readiness card in a sidebar column
