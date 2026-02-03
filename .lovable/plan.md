
# Warmy.io Email Warmup Integration

## Overview

Integrate Warmy.io to provide automatic email warmup and deliverability monitoring for connected mailboxes. This will help users improve their email sender reputation before running outreach campaigns.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WARMY.IO INTEGRATION SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DATABASE: email_connections (extended)                               │   │
│  │ + warmy_mailbox_id (integer)                                         │   │
│  │ + warmy_state (text: active, paused, disconnected)                   │   │
│  │ + deliverability_score, placement_score, dns_score (0-100)           │   │
│  │ + warmy_temperature (0-100)                                          │   │
│  │ + last_warmy_sync (timestamp)                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐   │
│  │ warmy-register  │   │ warmy-sync      │   │ warmy-actions           │   │
│  │ Edge Function   │   │ Edge Function   │   │ Edge Function           │   │
│  │                 │   │ (cron/manual)   │   │                         │   │
│  │ POST mailbox    │   │ GET all scores  │   │ pause/resume/test/del   │   │
│  │ to Warmy API    │   │ update DB       │   │                         │   │
│  └─────────────────┘   └─────────────────┘   └─────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ UI: Settings Page - Email Warmup Section                            │   │
│  │ - Warmup status card per mailbox                                     │   │
│  │ - Temperature gauge, health scores                                   │   │
│  │ - Pause/Resume toggle, Run Test button                               │   │
│  │ - DNS records checklist                                              │   │
│  │ - Alerts display                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ UI: Dashboard Overview Widget                                        │   │
│  │ - Total mailboxes warming                                            │   │
│  │ - Average deliverability score                                       │   │
│  │ - Alerts count                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Database Schema Changes

Extend the existing `email_connections` table with Warmy-specific fields:

```sql
ALTER TABLE public.email_connections
ADD COLUMN warmy_mailbox_id INTEGER,
ADD COLUMN warmy_state TEXT CHECK (warmy_state IN ('active', 'paused', 'disconnected')),
ADD COLUMN deliverability_score INTEGER CHECK (deliverability_score >= 0 AND deliverability_score <= 100),
ADD COLUMN placement_score INTEGER CHECK (placement_score >= 0 AND placement_score <= 100),
ADD COLUMN dns_score INTEGER CHECK (dns_score >= 0 AND dns_score <= 100),
ADD COLUMN warmy_temperature INTEGER CHECK (warmy_temperature >= 0 AND warmy_temperature <= 100),
ADD COLUMN last_warmy_sync TIMESTAMPTZ;
```

---

## Part 2: Required Secrets

| Secret | Purpose |
|--------|---------|
| WARMY_API_KEY | Bearer token for Warmy API authentication |
| WARMY_HOLDER_UID | Required header for all Warmy API requests |

---

## Part 3: Edge Functions

### 1. `warmy-register` - Register mailbox with Warmy

Called after a Gmail OAuth connection is established.

**Endpoint**: POST to Warmy API `/api/v2/mailboxes`

**Process**:
1. Receive connection_id from client
2. Fetch email connection from database (including OAuth tokens)
3. Build Warmy registration payload for OAuth Google
4. POST to Warmy API with Bearer token and holder-uid headers
5. Store returned mailbox ID in `warmy_mailbox_id` column
6. Set `warmy_state` to 'active'

```typescript
// Request payload for OAuth Google
{
  "mailbox": {
    "email": "user@gmail.com",
    "provider": "oauth_google",
    "from_name": "User Name",
    "tariff_plan_type_id": 1,
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1729259022,
    "client_id": GOOGLE_CLIENT_ID,
    "client_secret": GOOGLE_CLIENT_SECRET,
    "redirect_uri": "...",
    "token_credential_uri": "https://oauth2.googleapis.com/token",
    "setting_attributes": {
      "speed_mode": "medium"
    }
  }
}
```

### 2. `warmy-sync` - Sync health scores

Can be called manually or via cron (hourly).

**Endpoint**: GET from Warmy API `/api/v2/mailboxes`

**Process**:
1. Fetch all user's mailboxes from Warmy
2. For each mailbox in response:
   - Extract scores: deliverability_score, placement_score, dns_score
   - Extract temperature and state
3. Update `email_connections` table with new values
4. Set `last_warmy_sync` to current timestamp

### 3. `warmy-actions` - Pause/Resume/Test/Disconnect

Handles various Warmy actions.

**Actions**:

| Action | Warmy Endpoint | Method |
|--------|----------------|--------|
| pause | `/api/v2/mailboxes/{id}/update_state` | PUT with `{"mailbox": {"state": "pause!"}}` |
| resume | `/api/v2/mailboxes/{id}/update_state` | PUT with `{"mailbox": {"state": "activate!"}}` |
| test | `/api/v2/mailboxes/{id}/deliverability_checkers` | POST with providers array |
| disconnect | `/api/v2/mailboxes/{id}` | DELETE with reason |
| get_details | `/api/v2/mailboxes/{id}` | GET for full mailbox info |
| get_alerts | `/api/v2/warmup_alerts` | GET filtered by domain |

---

## Part 4: React Hook - useWarmyStatus

New hook to manage Warmy state and actions.

```typescript
// src/hooks/useWarmyStatus.ts
export function useWarmyStatus() {
  return {
    // Data
    warmyConnections,  // email_connections with warmy data
    isLoading,
    alerts,            // warmup alerts from API
    
    // Actions
    registerWithWarmy, // Register after OAuth
    syncScores,        // Manual refresh
    pauseWarmup,
    resumeWarmup,
    runDeliverabilityTest,
    disconnectFromWarmy,
    getMailboxDetails, // Get DNS records, etc.
  };
}
```

---

## Part 5: UI Components

### 1. WarmyStatusCard Component

Displays warmup status for a single mailbox.

```text
┌─────────────────────────────────────────────────────────────────┐
│ 📧 john@gmail.com                              [🔥 Warming]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Temperature                    Health Scores                   │
│  ┌───────────┐                 ┌─────────────────────────────┐ │
│  │    72     │                 │ Deliverability    85/100    │ │
│  │   /100    │                 │ Placement         78/100    │ │
│  │  ██████░░ │                 │ DNS               92/100    │ │
│  └───────────┘                 └─────────────────────────────┘ │
│                                                                 │
│  📊 Sent Today: 24  |  📥 Received Today: 18  |  Day 14        │
│                                                                 │
│  [ Pause Warmup ]    [ Run Test ]    [ View Details ]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**States**:
- Warming (active) - green badge, animated thermometer
- Paused - yellow badge, dimmed card
- Ready (temperature >= 90) - blue "Ready" badge
- Needs Attention (score < 70) - orange warning badge

### 2. WarmyDetailsSheet Component

Slide-in sheet showing detailed mailbox info.

```text
┌─────────────────────────────────────────────────────────────────┐
│ Mailbox Details - john@gmail.com                          [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ DNS Records                                                     │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ SPF Record         Configured correctly                  ││
│ │ ✅ DKIM Record        Valid                                 ││
│ │ ⚠️ DMARC Record       Missing - Recommended                 ││
│ │ ✅ MX Record          Valid                                 ││
│ │ ✅ A Record           Valid                                 ││
│ │ ✅ Reverse DNS        Configured                            ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ Warmup Settings                                                 │
│ Speed: [ Slow ] [ Medium ●] [ Fast ]                           │
│                                                                 │
│ Latest Deliverability Test                                      │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Google: 95% Inbox  |  Outlook: 88% Inbox  |  Yahoo: 92%    ││
│ │ Tested: 2 hours ago                                         ││
│ └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│ [ Run New Test ]              [ Disconnect from Warmy ]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Dashboard Widget - Email Health Overview

Small card on main dashboard.

```text
┌─────────────────────────────────────────┐
│ 📨 Email Health                         │
├─────────────────────────────────────────┤
│                                         │
│  2 mailboxes warming                    │
│  Avg. Deliverability: 82%               │
│                                         │
│  ⚠️ 1 mailbox needs attention           │
│                                         │
│            [ View Details → ]           │
└─────────────────────────────────────────┘
```

### 4. Alert Banner Component

Shows when deliverability is low.

```text
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Low Deliverability Alert                                     │
│ john@gmail.com has a deliverability score of 48%.               │
│ Outreach campaigns from this mailbox are auto-paused.           │
│                                 [ View in Settings ]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Integration Flow

### When User Connects Gmail

1. User completes Gmail OAuth (existing flow)
2. Show prompt: "Enable email warmup?"
3. If yes, call `warmy-register` edge function
4. Update UI to show warmup status card

### Auto-Pause Logic

In the `send-email` edge function, add check:

```typescript
// Before sending, check deliverability
if (connection.deliverability_score && connection.deliverability_score < 50) {
  return { error: "Email sending paused due to low deliverability score (${score}%). Please wait for warmup to complete." };
}

if (connection.deliverability_score && connection.deliverability_score < 70) {
  // Still send, but include warning in response
  // UI shows warning toast
}
```

### Hourly Sync (Optional Cron)

Set up pg_cron to call `warmy-sync` every hour:

```sql
SELECT cron.schedule(
  'warmy-hourly-sync',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://PROJECT_ID.supabase.co/functions/v1/warmy-sync',
    headers := '{"Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Part 7: Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/warmy-register/index.ts` | CREATE | Register mailbox with Warmy |
| `supabase/functions/warmy-sync/index.ts` | CREATE | Sync health scores |
| `supabase/functions/warmy-actions/index.ts` | CREATE | Pause/resume/test/disconnect |
| `src/hooks/useWarmyStatus.ts` | CREATE | React hook for Warmy state |
| `src/components/email/WarmyStatusCard.tsx` | CREATE | Mailbox warmup status display |
| `src/components/email/WarmyDetailsSheet.tsx` | CREATE | Detailed mailbox info sheet |
| `src/components/email/WarmyAlertBanner.tsx` | CREATE | Low deliverability warning |
| `src/components/dashboard/EmailHealthWidget.tsx` | CREATE | Dashboard overview widget |
| `src/pages/Settings.tsx` | MODIFY | Add Warmy section below Email Integrations |
| `src/pages/Dashboard.tsx` | MODIFY | Add Email Health widget |
| `supabase/functions/send-email/index.ts` | MODIFY | Add deliverability check before sending |
| `supabase/functions/oauth-callback/index.ts` | MODIFY | Optionally auto-register with Warmy |
| `supabase/config.toml` | MODIFY | Add new function configurations |

---

## Part 8: Implementation Order

1. **Secrets**: Add WARMY_API_KEY and WARMY_HOLDER_UID secrets
2. **Database**: Run migration to add Warmy columns to email_connections
3. **Edge Function**: Create `warmy-register` function
4. **Edge Function**: Create `warmy-sync` function
5. **Edge Function**: Create `warmy-actions` function
6. **Hook**: Create useWarmyStatus hook
7. **UI**: Create WarmyStatusCard component
8. **UI**: Create WarmyDetailsSheet component
9. **Settings**: Add Warmy section to Settings page
10. **Dashboard**: Add EmailHealthWidget to Dashboard
11. **Send Email**: Add deliverability check to send-email function
12. **Alerts**: Create WarmyAlertBanner and integrate
13. **Cron (optional)**: Set up hourly sync job

---

## Technical Notes

### API Rate Limiting
Warmy API has a 60 requests/minute limit. The sync function should batch requests and implement retry logic with exponential backoff.

### Token Sharing
When registering with Warmy, we share the user's OAuth tokens. Warmy uses these to send/receive warmup emails on their behalf. Users should be informed about this.

### Error Handling
If Warmy registration fails, the Gmail connection still works for sending. Warmy is an optional enhancement.

### Score Thresholds

| Score Range | Status | Action |
|-------------|--------|--------|
| 90-100 | Excellent | Green, fully ready |
| 70-89 | Good | Yellow, proceed with caution |
| 50-69 | Fair | Orange, show warning before sending |
| 0-49 | Poor | Red, auto-pause outreach |
