
# Comprehensive Email Health & Smart Sending System

## Overview
Transform the Warmy.io integration into a seamless, user-friendly email health management system. Users will see their email readiness at a glance, understand sending limits, and have automatic protection against damaging their sender reputation.

---

## What We'll Build

### 1. Enhanced Dashboard Email Health Card
Replace the simple widget with a rich, informative "Email Readiness" card showing:
- **Sending Readiness Status**: Clear indicator (Ready / Warming Up / Paused)
- **Daily Sending Capacity**: Shows recommended emails per day based on warmup temperature
- **Temperature Gauge**: Visual thermometer showing warmup progress (0-100)
- **Quick Stats**: Sent today / Received today from Warmy
- **Next Action**: Smart suggestion ("Run deliverability test", "Your mailbox needs attention", etc.)

### 2. Smart Sending Gate in Send Email Dialog
Before sending, automatically check:
- Is warmup complete (temperature >= 85)?
- Is deliverability score healthy (>= 70)?
- Have they exceeded daily recommended sending limit?

Show users:
- A "Sending Health Check" panel before send
- Warnings if sending could hurt reputation
- Recommended wait time if limit exceeded

### 3. Daily Sending Limit Tracking
Add new columns to `email_connections` table:
- `daily_send_limit` - Warmy-recommended limit based on temperature
- `emails_sent_today` - Counter that resets daily
- `last_send_count_reset` - Timestamp for daily reset

Add to `warmy-sync`:
- Fetch and store the current recommended sending limit
- Calculate based on temperature (e.g., temp 15 = ~5-10 emails, temp 90+ = 50+ emails)

### 4. Pre-Send Email Validation
Create new endpoint `check-send-readiness`:
- Returns current sending capacity
- Returns whether user can send more today
- Returns health score and warnings
- Returns suggested wait time if at limit

### 5. Improved Warmy Details in Settings
Enhance the WarmyDetailsSheet with:
- **Warmup Progress Timeline**: Visual showing warmup journey
- **Provider Deliverability Breakdown**: Google/Outlook/Yahoo scores with visual bars
- **DNS Health Checklist**: Clear pass/fail indicators with fix suggestions
- **Sending Statistics**: Chart showing sent/received over time
- **Smart Recommendations**: AI-generated tips based on current status

### 6. Email Readiness Onboarding
When a user first enables warmup, show:
- Explanation of what warmup does
- Expected timeline (typically 2-4 weeks)
- What they can do now vs later
- Daily check-in prompts

---

## User Experience Flow

```text
+------------------------------------------+
|         DASHBOARD - EMAIL HEALTH         |
+------------------------------------------+
|                                          |
|  [Thermometer Icon] Email Readiness      |
|  ----------------------------------------|
|  Temperature: ████████░░░░ 72/100        |
|  Status: Warming Up (8 days remaining)   |
|                                          |
|  Today's Capacity                        |
|  [===-----] 3/25 emails sent             |
|                                          |
|  Deliverability: 85% [Good]              |
|  DNS Health: 5/6 records OK              |
|                                          |
|  [View Details] [Run Test]               |
+------------------------------------------+
```

When clicking "Send Email":

```text
+------------------------------------------+
|         PRE-SEND HEALTH CHECK            |
+------------------------------------------+
|                                          |
|  ✓ Mailbox is warmed up (72/100)         |
|  ✓ Deliverability healthy (85%)          |
|  ✓ Daily limit OK (3/25 sent today)      |
|                                          |
|  [Send Email] or [Schedule for Later]    |
+------------------------------------------+
```

---

## Technical Implementation

### Database Changes
Add columns to `email_connections`:
```sql
ALTER TABLE email_connections ADD COLUMN IF NOT EXISTS 
  daily_send_limit integer DEFAULT 5,
  emails_sent_today integer DEFAULT 0,
  last_send_count_reset timestamp with time zone DEFAULT now(),
  warmup_started_at timestamp with time zone;
```

### New/Updated Edge Functions

**1. Update `warmy-sync`**
- Fetch sending_limit from Warmy mailbox details
- Store temperature-based recommended daily limit
- Parse and store more detailed scores

**2. Update `send-email`**
- Check daily limit before sending
- Increment `emails_sent_today` counter
- Reset counter if new day
- Return remaining capacity in response

**3. New `check-send-readiness`**
- Quick check endpoint for UI
- Returns: canSend, remainingToday, temperatureReady, warnings[]

### Frontend Components

**1. New: `EmailReadinessCard.tsx`**
- Rich dashboard widget replacing EmailHealthWidget
- Temperature gauge with animation
- Sending capacity bar
- Quick actions

**2. New: `SendHealthCheck.tsx`**
- Pre-send validation panel
- Shows in SendEmailDialog before confirmation
- Clear pass/fail indicators

**3. Updated: `WarmyDetailsSheet.tsx`**
- Add warmup timeline visualization
- Provider score breakdown bars
- Better DNS record display
- Sending statistics section

**4. New: `WarmupOnboarding.tsx`**
- Modal shown when first enabling warmup
- Explains the process
- Sets expectations

**5. Updated: `WarmyStatusCard.tsx`**
- Add daily capacity indicator
- Show warmup progress more prominently
- Add "days remaining" estimate

### Hook Updates

**Update `useWarmyStatus.ts`**
- Add `checkSendReadiness()` function
- Add `getSendingCapacity()` helper
- Add computed values for daily limits
- Add warmup progress percentage

---

## Files to Create/Modify

### New Files
1. `src/components/email/EmailReadinessCard.tsx` - Rich dashboard widget
2. `src/components/email/SendHealthCheck.tsx` - Pre-send validation
3. `src/components/email/WarmupOnboarding.tsx` - First-time setup modal
4. `src/components/email/TemperatureGauge.tsx` - Animated temperature display
5. `src/components/email/SendingCapacityBar.tsx` - Daily limit progress bar
6. `supabase/functions/check-send-readiness/index.ts` - Quick validation endpoint

### Modified Files
1. `supabase/functions/warmy-sync/index.ts` - Fetch more data, calculate limits
2. `supabase/functions/send-email/index.ts` - Add limit checking and tracking
3. `src/hooks/useWarmyStatus.ts` - Add send readiness functions
4. `src/components/email/SendEmailDialog.tsx` - Add health check panel
5. `src/components/email/WarmyDetailsSheet.tsx` - Enhanced details view
6. `src/components/email/WarmyStatusCard.tsx` - Better progress display
7. `src/pages/Dashboard.tsx` - Use new EmailReadinessCard

### Database Migration
- Add columns: `daily_send_limit`, `emails_sent_today`, `last_send_count_reset`, `warmup_started_at`

---

## Key User Benefits

1. **No Confusion**: Users always know if they're ready to send
2. **Protected Reputation**: Auto-limits prevent over-sending
3. **Clear Progress**: See exactly how warmup is progressing
4. **Smart Guidance**: System tells them what to do next
5. **Zero Technical Knowledge Required**: Everything is simplified
6. **Automatic Safety**: Can't accidentally damage deliverability

---

## Implementation Order

1. Database migration (add new columns)
2. Update `warmy-sync` to fetch and store more data
3. Create `check-send-readiness` endpoint
4. Update `send-email` with limit tracking
5. Build `TemperatureGauge` and `SendingCapacityBar` components
6. Create `EmailReadinessCard` for dashboard
7. Add `SendHealthCheck` to SendEmailDialog
8. Enhance `WarmyDetailsSheet`
9. Create `WarmupOnboarding` modal
10. Update hook with new functions
