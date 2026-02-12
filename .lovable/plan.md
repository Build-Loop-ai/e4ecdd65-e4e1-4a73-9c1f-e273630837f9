
# Billing Enforcement -- Making Monetization Production-Ready

## Problem

The billing infrastructure (Stripe checkout, subscription check, billing UI) exists, but **nothing actually enforces limits**. A free-tier user can create unlimited pitches and send unlimited emails because no code checks the subscription plan before allowing those actions.

Additionally, there are two bugs in the current `check-subscription` function:
- It returns `"subscribed": true` with `"plan": "free"` when a user has a Stripe customer but no matching price ID -- this is contradictory
- The `subscription_end` is sometimes `null` even for active subscriptions due to date parsing issues

## What Needs to Be Built

### 1. Pitch creation gating (Free = 3/month)

Before saving a new pitch in both `NewPitch.tsx` and `NewPitchFlow.tsx`:
- Query `subscriptions` table for current `pitches_used` count
- Compare against `PLAN_LIMITS[plan].pitches` (-1 = unlimited)
- If limit reached, show an upgrade prompt instead of proceeding
- After successful pitch creation, increment `pitches_used` in the `subscriptions` table

### 2. Email sending gating (Free = 10/month, Pro = 100/month)

Before sending in `SendEmailDialog.tsx` and `auto-outreach` edge function:
- Check `emails_used` against `PLAN_LIMITS[plan].emails`
- Block send and show upgrade prompt if limit reached
- After successful send, increment `emails_used`

### 3. Monthly usage reset

Add a `current_period_start` field check. When a new billing period starts (or monthly for free users), reset `pitches_used` and `emails_used` to 0. This will be handled in the `check-subscription` edge function -- when it detects a period change, it resets the counters.

### 4. Fix `check-subscription` plan detection

The function currently returns `subscribed: true, plan: "free"` when a user has a Stripe customer with an active subscription but the price ID doesn't match the hardcoded values. Fix the plan detection logic to properly handle unknown price IDs and return consistent `subscribed` status.

### 5. Usage display in the UI

Add a small usage indicator on the Dashboard showing "2/3 pitches used" and "5/10 emails used" so users can see where they stand before hitting the wall.

---

## Technical Details

### Files to create
- None (all changes go in existing files)

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useSubscription.ts` | Add `pitchesUsed`, `emailsUsed` fields; add `incrementPitchUsage()` and `incrementEmailUsage()` helpers that update the `subscriptions` table |
| `src/pages/NewPitch.tsx` | Import `useSubscription`, check pitch limit before `handleSave`, show upgrade dialog if exceeded |
| `src/components/dashboard/NewPitchFlow.tsx` | Same pitch limit check before `handleSave` |
| `src/components/email/SendEmailDialog.tsx` | Import `useSubscription`, check email limit before `handleSend`, show upgrade prompt if exceeded |
| `supabase/functions/auto-outreach/index.ts` | Query `subscriptions` table for plan limits before sending; increment `emails_used` after each send |
| `supabase/functions/check-subscription/index.ts` | Fix plan detection; add usage reset logic when billing period rolls over; fix `subscribed` flag consistency |
| `src/components/dashboard/StatsCards.tsx` | Add pitch/email usage indicators |
| `src/components/settings/BillingSettings.tsx` | Show current usage on each plan card (e.g., "2/3 pitches used") |

### Edge function changes

In `check-subscription`:
- When `plan !== "free"` and subscription is active, check if `current_period_start` has changed. If so, reset `pitches_used` and `emails_used` to 0.
- For free users, reset counters on the 1st of each month.
- Return `pitches_used` and `emails_used` in the response so the frontend can display them.
- Fix: if active subscription exists but price ID doesn't match any known plan, default to returning `subscribed: true` with the product info but a sensible plan fallback.

In `auto-outreach`:
- Before the send loop, query the user's subscription to check remaining email quota.
- Cap the number of sends to `Math.min(remaining_daily_cap, remaining_monthly_quota)`.
- After each successful send, increment `emails_used`.

### Upgrade prompt component

Create a reusable `UpgradeBanner` component that:
- Shows when a limit is reached
- Displays which limit was hit (pitches or emails)
- Has a CTA button linking to Settings > Billing tab
- Can be used inline in NewPitch, SendEmailDialog, and Dashboard
