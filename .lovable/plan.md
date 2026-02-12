

# AI Image Quality Guard -- Auto-detect and replace ugly images

## Problem
Currently, the system only checks if images are *missing*. But scraped images from websites are often:
- Low resolution / blurry
- Have text overlays, watermarks, or heavy compression artifacts
- Are broken URLs (404s)
- Are tiny icons that slipped through filters
- Are screenshots or stock-placeholder-quality imagery

These ugly images make it through to the final pitch, hurting the professional look.

## Solution: Two-Layer Image Quality System

### Layer 1: Post-Processing Quality Audit (Automatic)
After `process-content` returns the schema, run a new **`audit-images`** edge function that:

1. **Checks each image URL is reachable** (HEAD request, check status + content-type + content-length)
2. **Sends reachable images to AI vision** for quality scoring (using Gemini flash with image input)
3. Returns a quality verdict per image: `pass` / `fail` with reason
4. Any `fail` image gets flagged for auto-replacement

The AI vision prompt scores on:
- Resolution adequacy (not tiny/pixelated)
- Text/watermark contamination
- Professional quality (composition, lighting)
- Relevance to business type

### Layer 2: Auto-Replace Pipeline
Images that fail the audit are automatically regenerated using the existing `generate-images` or `regenerate-image` infrastructure, with prompts driven by business context (location, industry, services).

## Implementation Plan

### 1. New Edge Function: `supabase/functions/audit-images/index.ts`
- Accepts: `{ images: string[], businessType: string, industry: string }`
- For each image URL:
  - HEAD request to check accessibility (timeout 5s)
  - If accessible, send to Gemini flash vision with a quality-check prompt
  - Return `{ url, status: 'pass'|'fail'|'unreachable', reason, score }[]`
- Uses `LOVABLE_API_KEY` (already available)
- Rate-limit aware: processes images in batches of 3-4

### 2. New Client Utility: `src/lib/imageQualityAudit.ts`
- `auditAndFixImages(schema, previewId)` function
- Collects all image URLs from hero, gallery, and services
- Calls `audit-images` edge function
- For any failed/unreachable images, calls `regenerate-image` to replace them
- Returns the updated schema with bad images swapped out

### 3. Integrate into Pitch Creation Flow
- In `src/pages/NewPreview.tsx`: after `process-content` and before saving, run the audit
- Add a new scanning animation step: "Checking Image Quality" between processing and generating
- Only regenerate images that fail the audit (not all missing ones)

### 4. Integrate into Manage Page
- In `src/components/manage/ImageRegenerator.tsx`: add a "Check Quality" button
- Shows which images passed/failed with visual indicators (green check / red X)
- One-click "Fix All" to regenerate all failed images at once

### 5. Update `supabase/config.toml`
- Add `[functions.audit-images]` with `verify_jwt = false`

## Technical Details

### AI Vision Quality Prompt (used in audit-images)
```
Analyze this image for use on a professional {businessType} website.
Score from 1-10 on: resolution, professionalism, relevance, text-free.
If any score is below 5, verdict is FAIL.
Return JSON: { score: number, verdict: "pass"|"fail", reason: string }
```

### New Pitch Flow Steps
```text
URL Input -> Scraping -> Processing Content -> Auditing Images -> Generating Replacements -> Template Selection -> Done
```

### Image Audit Response Shape
```typescript
interface ImageAuditResult {
  url: string;
  status: 'pass' | 'fail' | 'unreachable';
  score: number;       // 1-10
  reason: string;      // e.g. "Low resolution", "Contains text overlay"
  replacement?: string; // If auto-replaced, the new URL
}
```

## Files to Create
- `supabase/functions/audit-images/index.ts` -- Edge function for AI-powered image quality check
- `src/lib/imageQualityAudit.ts` -- Client-side orchestrator

## Files to Modify
- `src/pages/NewPreview.tsx` -- Add audit step to pitch creation pipeline
- `src/components/manage/ImageRegenerator.tsx` -- Add quality check UI + "Fix All" button
- `supabase/config.toml` -- Register new edge function

