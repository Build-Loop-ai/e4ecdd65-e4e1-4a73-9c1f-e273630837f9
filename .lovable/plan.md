

# Fix: Email Address Collection for Leads

## The Problem

Right now, leads almost never have email addresses. There are two potential sources, and neither works well:

1. **Google Maps (Apify)**: The current scraper actor (`compass~crawler-google-places`) rarely returns emails because Google Maps listings don't typically expose them directly.

2. **Website scraping (Firecrawl + AI processing)**: When a pitch is created, the AI *does* extract `contact.email` from the scraped website content. However, this email is stored inside the pitch data (`processed_schema.contact.email`) and is **never written back to the lead record** in the database.

## The Fix (Two Parts)

### Part 1: Backfill lead email from scraped website content

When a pitch is created from a lead, and the AI extracts an email from the website, automatically update the lead's `email` field in the database.

**Where**: `src/pages/NewPreview.tsx` -- after `process-content` returns the schema and before/after saving the pitch, check if a `leadId` was passed and if `processedSchema.contact.email` exists. If the lead currently has no email, update it.

**Also**: `src/pages/NewPreview.tsx` already receives lead context (client name, URL). Need to also pass the `leadId` through the flow so we can update it.

### Part 2: Extract emails during lead discovery (Apify enrichment)

Enhance the `apify-google-maps` edge function to also extract emails from website content when a lead has a website but no email. This uses a lightweight approach:

- After getting results from Apify, for each lead that has a `website` but no `email`, do a quick fetch of the website HTML and use a regex to find email addresses on the page.
- This runs server-side in the edge function, so it doesn't slow down the client.
- Batch process with a concurrency limit (3 at a time) to avoid timeouts.

**Where**: `supabase/functions/apify-google-maps/index.ts` -- add email extraction step after receiving Apify results.

### Part 3: Show email status in lead cards

Update the lead card UI to clearly show when an email is available vs missing, making it obvious which leads are ready for outreach.

**Where**: `src/components/leads/LeadCard.tsx` -- add visual indicator for email availability.

## Technical Details

### Email extraction regex (for Part 2)
```typescript
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
```
Filter out common false positives like `noreply@`, `admin@`, `info@wix.com`, `support@wordpress.com`, etc.

### Files to modify
- `supabase/functions/apify-google-maps/index.ts` -- Add website email scraping after Apify results
- `src/pages/NewPreview.tsx` -- Write extracted email back to lead record after pitch processing
- `src/components/leads/LeadCard.tsx` -- Visual email status indicator

### Edge cases handled
- Don't overwrite existing emails
- Timeout per website fetch (5 seconds)
- Filter out generic/platform emails (wix, wordpress, squarespace domains)
- Gracefully handle failed fetches (lead still saved, just without email)

