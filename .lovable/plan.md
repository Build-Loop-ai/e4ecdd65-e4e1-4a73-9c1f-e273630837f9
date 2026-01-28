
# Lead Generation & Email Outreach Implementation Plan

## Overview

This plan adds two major features to your pitch platform:
1. **Lead Finder** - Search for local businesses via Apify Google Maps and store them as leads
2. **Email Outreach** - Send pitch emails directly from the platform using Resend

---

## Phase 1: Lead Finder with Apify Google Maps

### What You'll Get
- A new "Find Leads" page at `/dashboard/leads`
- Search for businesses like "barbers in zaandam" 
- Get back: business name, website URL, phone, address, email (when available)
- One-click "Create Pitch" button per lead

### Data Retrieved from Apify

| Field | Example |
|-------|---------|
| Business Name | "Kapsalon Amsterdam" |
| Website | "https://kapsalonamsterdam.nl" |
| Phone | "+31 20 123 4567" |
| Email | "info@kapsalon.nl" (when found) |
| Address | "Hoofdstraat 1, 1000 AB Zaandam" |
| Category | "Barber shop" |
| Rating | 4.5 |

### Database Schema

```text
+-------------------+
|      leads        |
+-------------------+
| id (uuid, PK)     |
| user_id (uuid)    |  --> owner of the lead
| business_name     |
| website_url       |
| email             |  --> extracted from Google Maps
| phone             |
| address           |
| city              |
| category          |
| rating            |  --> Google Maps rating
| source_query      |  --> "barbers in zaandam"
| status            |  --> 'new', 'pitched', 'converted'
| preview_id (uuid) |  --> links to created pitch
| created_at        |
+-------------------+
```

### New Files to Create

1. **Database Migration** - Create `leads` table with RLS policies
2. **Edge Function** (`apify-google-maps`) - Calls Apify API to search businesses
3. **Lead Finder Page** (`src/pages/Leads.tsx`) - UI for searching and viewing leads
4. **API Client** (`src/lib/api/apify.ts`) - Frontend helper to call the edge function
5. **Update Navigation** - Add "Find Leads" to sidebar

### User Flow

```text
1. User navigates to /dashboard/leads
2. Enters search: "barbers in zaandam"
3. Clicks "Search"
4. Edge function calls Apify Google Maps scraper
5. Results displayed in a table/grid
6. User clicks "Create Pitch" on a lead
7. Redirects to /dashboard/new with website pre-filled
8. After pitch created, lead status updates to "pitched"
```

### API Key Requirement

You'll need an **Apify API token** from https://console.apify.com/account#/integrations

This will be stored as a secret (`APIFY_API_KEY`) and used by the edge function.

---

## Phase 2: Email Outreach with Resend

### What You'll Get
- "Send Pitch" button in the manage pitch view
- Compose email dialog with recipient details
- Professional HTML email template with pitch preview
- Track sent emails and status

### Database Schema

```text
+-----------------------+
|   outreach_emails     |
+-----------------------+
| id (uuid, PK)         |
| user_id (uuid)        |
| preview_id (uuid)     |  --> which pitch
| recipient_email       |
| recipient_name        |
| subject               |
| status                |  --> 'sent', 'opened', 'clicked'
| sent_at               |
| created_at            |
+-----------------------+
```

### New Files to Create

1. **Database Migration** - Create `outreach_emails` table
2. **Edge Function** (`send-pitch-email`) - Sends email via Resend API
3. **Send Pitch Dialog** (`src/components/manage/SendPitchDialog.tsx`)
4. **Email Template** - Professional HTML template with pitch preview
5. **Outreach History** - View sent emails per pitch

### Email Template Preview

```text
┌─────────────────────────────────────────────┐
│  [Your Logo]                                │
├─────────────────────────────────────────────┤
│                                             │
│  Hi {RecipientName},                        │
│                                             │
│  I've created a preview of what your        │
│  updated website could look like!           │
│                                             │
│  ┌───────────────────────────────┐         │
│  │ [Pitch Preview Thumbnail]     │         │
│  │                               │         │
│  │    {BusinessName}             │         │
│  └───────────────────────────────┘         │
│                                             │
│      [View Your Preview]                    │
│                                             │
│  Best regards,                              │
│  {YourName}                                 │
│                                             │
└─────────────────────────────────────────────┘
```

### API Key Requirement

You'll need a **Resend API key** from https://resend.com/api-keys

Plus a **verified domain** for sending emails: https://resend.com/domains

---

## Implementation Order

### Step 1: Setup Apify Integration
- Add `APIFY_API_KEY` secret
- Create edge function for Google Maps search
- Create leads database table

### Step 2: Build Lead Finder UI
- Create Leads page with search form
- Display results in a table
- Add "Create Pitch" action

### Step 3: Setup Resend Integration
- Add `RESEND_API_KEY` secret
- Create edge function for sending emails
- Create outreach_emails database table

### Step 4: Build Email Outreach UI
- Add "Send Pitch" button to manage view
- Create email compose dialog
- Show outreach history

---

## Technical Details

### Apify Edge Function

```typescript
// supabase/functions/apify-google-maps/index.ts
// Calls: https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items
// Input: { searchStringsArray: ["barbers in zaandam"], maxCrawledPlacesPerSearch: 20 }
// Returns: Array of businesses with name, website, phone, address, etc.
```

### Resend Edge Function

```typescript
// supabase/functions/send-pitch-email/index.ts  
// Uses RESEND_API_KEY
// Sends HTML email with pitch thumbnail and CTA button
// From: noreply@yourdomain.com (must be verified in Resend)
```

### Navigation Update

```typescript
// Add to DashboardLayout navItems:
{ to: '/dashboard/leads', icon: Search, label: 'Find Leads' },
```

---

## Prerequisites Before Starting

1. **Apify Account** - Sign up at https://apify.com (free tier: 5 USD/month)
2. **Apify API Token** - Get from https://console.apify.com/account#/integrations
3. **Resend Account** - Sign up at https://resend.com (free tier: 100 emails/day)
4. **Resend API Key** - Get from https://resend.com/api-keys
5. **Verified Domain** - Add domain at https://resend.com/domains

---

## Estimated Work

| Phase | Components | Estimate |
|-------|------------|----------|
| Phase 1: Lead Finder | DB + Edge + UI | ~45 min |
| Phase 2: Email Outreach | DB + Edge + UI + Template | ~45 min |

**Total: ~90 minutes**
