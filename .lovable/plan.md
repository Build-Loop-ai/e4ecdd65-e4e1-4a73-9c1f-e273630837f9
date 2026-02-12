

# Intelligent Outreach Automation

This adds a new **"Outreach"** tab to Settings and powerful automation features that turn your lead pipeline into a hands-off outreach machine.

## What gets built

### 1. Auto-Pitch & Auto-Send for New Leads
A toggle in Settings that, when enabled, automatically:
- Creates a pitch for every newly saved lead that has a website
- Generates a personalized AI email and sends it once the pitch is ready
- Runs in the background -- you search for leads, save them, and the system handles the rest

This works by adding a new `outreach_settings` table to store preferences, and a new backend function (`auto-outreach`) that orchestrates the pitch creation and email sending pipeline.

### 2. Bulk "Send to All" Button
A one-click button on the My Leads page that:
- Finds all leads that have an email + a pitch but haven't been emailed yet
- Generates personalized AI copy for each one
- Sends them in sequence with a short delay between each (to protect deliverability)
- Shows a progress indicator ("Sending 3 of 12...")

### 3. Smart Follow-Up Reminders
The system tracks which emails were sent and when. If a pitch email was sent but:
- No visit was recorded on the pitch page within 3 days, it surfaces a "nudge" suggestion
- A visit happened but no feedback was left, it suggests a different follow-up

These show up as action cards on the Dashboard.

### 4. Outreach Settings Tab
A new tab in Settings (replacing or alongside the current Warmup tab) with:
- **Auto-send toggle**: Enable/disable automatic outreach for new leads
- **Daily send cap**: Maximum emails per day (respects warmup limits too)
- **Sending window**: Preferred hours to send (e.g., 9am-5pm in their timezone)
- **Follow-up enabled**: Toggle for automatic follow-up suggestions
- **Default tone**: Casual / Professional / Bold -- passed to the AI copy generator

## Technical Details

### New database table: `outreach_settings`
| Column | Type | Default |
|---|---|---|
| id | uuid | gen_random_uuid() |
| user_id | uuid (unique) | - |
| auto_send_enabled | boolean | false |
| daily_cap | integer | 20 |
| send_window_start | integer | 9 (hour) |
| send_window_end | integer | 17 (hour) |
| followup_enabled | boolean | true |
| tone | text | 'professional' |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Users can only read/update their own row.

### New backend function: `auto-outreach`
- Triggered after a lead is saved (called from the client after save)
- Checks if auto-send is enabled for the user
- If yes: creates pitch via existing `process-content` flow, then generates email copy and sends
- Respects daily cap and warmup limits
- Logs activity to `outreach_emails` table

### Files to create
- `supabase/functions/auto-outreach/index.ts` -- orchestration function
- `src/components/settings/OutreachSettings.tsx` -- settings UI component

### Files to modify
- `src/pages/Settings.tsx` -- add Outreach tab with the new component
- `src/hooks/useLeads.ts` -- trigger auto-outreach after saving leads
- `src/components/leads/SavedLeadsList.tsx` -- add "Send to All Unsent" bulk action
- `src/pages/Dashboard.tsx` -- add follow-up reminder cards
- `src/components/leads/BulkActionsBar.tsx` -- add bulk send button

### Sequencing
1. Create `outreach_settings` table with migration
2. Build the Outreach Settings UI tab
3. Build the `auto-outreach` edge function
4. Wire up auto-outreach trigger in lead saving flow
5. Add "Send to All" bulk action on My Leads
6. Add follow-up reminder cards to Dashboard

