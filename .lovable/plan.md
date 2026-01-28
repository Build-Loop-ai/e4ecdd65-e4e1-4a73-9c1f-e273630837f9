
# AI Image Generation for Stunning Previews

## Overview

When scraped websites lack quality images, automatically generate professional, industry-specific visuals using AI to ensure every preview looks like a premium, real website.

## Current Image Gaps

| Section | Current Behavior | Impact |
|---------|-----------------|--------|
| Hero | Falls back to SVG pattern | Looks generic |
| Gallery | Hidden if < 3 images | Section missing entirely |
| Services | Shows colored squares | Unprofessional |
| About | No image at all | Less engaging |

## Solution Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    AI IMAGE GENERATION PIPELINE                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Scrape Website (Firecrawl)                                        │
│              ↓                                                         │
│  2. Process Content (AI analysis + image classification)              │
│              ↓                                                         │
│  3. Detect Image Gaps                                                 │
│     • Hero: No text-free images?                                      │
│     • Gallery: < 3 images?                                            │
│     • Services: No service images?                                    │
│              ↓                                                         │
│  4. Generate Missing Images (NEW)                                     │
│     • Industry-specific prompts                                       │
│     • Brand color integration                                         │
│     • Upload to Supabase Storage                                      │
│              ↓                                                         │
│  5. Return Complete Schema with All Images                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: New Edge Function - `generate-images`

Creates an edge function that generates industry-specific images on demand.

### Input Structure
```json
{
  "businessType": "barber",
  "industry": "beauty_wellness",
  "companyName": "SNIP Barbershop",
  "primaryColor": "#D4AF37",
  "missingImages": {
    "hero": true,
    "gallery": 4,
    "services": ["Haircut", "Beard Trim"]
  }
}
```

### Output Structure
```json
{
  "generatedImages": {
    "hero": "https://storage.../generated/hero-abc123.png",
    "gallery": [
      "https://storage.../generated/gallery-1.png",
      "https://storage.../generated/gallery-2.png"
    ],
    "services": {
      "Haircut": "https://storage.../generated/service-haircut.png",
      "Beard Trim": "https://storage.../generated/service-beard.png"
    }
  }
}
```

---

## Part 2: Industry-Specific Prompt Templates

Each business type gets tailored image generation prompts:

| Industry | Hero Prompt | Gallery Prompt |
|----------|-------------|----------------|
| Barber | "Modern barbershop interior, warm lighting, vintage leather chairs, brass fixtures, NO text, NO people" | "Stylish men's haircut result, professional photography" |
| Restaurant | "Elegant restaurant interior, ambient lighting, beautifully set tables, NO text, NO logos" | "Gourmet dish, professional food photography, artistic plating" |
| Dentist | "Modern dental clinic, clean white interior, professional medical environment, NO text" | "Healthy bright smile, dental care concept" |
| Lawyer | "Professional law office, wood paneling, legal books, sophisticated lighting, NO text" | "Scales of justice, legal documents, professional setting" |
| Florist | "Beautiful flower shop interior, colorful arrangements, natural light, NO text" | "Stunning floral arrangement, vibrant colors" |

### Color Integration
All prompts include: "Color palette featuring {primaryColor} accents"

---

## Part 3: Storage Bucket Setup

Create a dedicated storage bucket for generated images:

```sql
-- Storage bucket for AI-generated preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Policy: Allow public reads
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

-- Policy: Allow authenticated writes (edge functions use service role)
CREATE POLICY "Service role write access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images');
```

---

## Part 4: Integration with Preview Flow

### Updated NewPreview.tsx Flow

```text
1. User enters URL
           ↓
2. Firecrawl scrapes content + branding
           ↓
3. process-content analyzes & classifies images
           ↓
4. Check for image gaps:
   • heroImages.length === 0?
   • galleryImages.length < 3?
   • services without images?
           ↓
5. If gaps exist → Call generate-images
           ↓
6. Merge generated images into schema
           ↓
7. Save to client_previews with complete imagery
```

---

## Part 5: Prompt Engineering Details

### Hero Image Prompt Template
```
Professional {industry} environment photograph.
{specific_scene_description}
Interior/exterior establishing shot.
High-end commercial photography style.
Warm ambient lighting with {primaryColor} accent tones.
Ultra wide angle, 4K quality.
CRITICAL: Absolutely NO text, NO logos, NO signs, NO words visible anywhere.
Photorealistic, magazine quality.
```

### Gallery Image Prompt Template
```
{service_or_product} photograph for {businessType}.
Professional {industry} photography.
Clean background, studio quality lighting.
Brand colors: {primaryColor} accents where appropriate.
Photorealistic, commercial photography style.
NO text, NO watermarks.
```

### Service Icon Prompt Template
```
Minimalist icon illustration representing "{serviceName}".
Simple, elegant, modern design.
{primaryColor} color scheme.
White background, clean vector-style.
Professional service icon for business website.
```

---

## Part 6: Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/generate-images/index.ts` | CREATE | Main image generation edge function |
| `src/lib/imageGeneration.ts` | CREATE | Client-side API wrapper + prompt templates |
| `src/pages/NewPreview.tsx` | MODIFY | Add image generation step after processing |
| `src/components/preview/ScanningProgress.tsx` | MODIFY | Add "Generating visuals" step |

---

## Part 7: User Experience

### Scanning Animation Updates
```text
Step 1: "Scanning website..." ✓
Step 2: "Extracting content..." ✓
Step 3: "Analyzing brand..." ✓
Step 4: "Generating visuals..." ← NEW (only if needed)
Step 5: "Building preview..." ✓
```

### Visual Feedback
- Show "Creating stunning visuals for your preview" message
- Display placeholder shimmer effects while generating
- Estimated time: 10-20 seconds for image generation

---

## Part 8: Cost Optimization

To manage AI usage costs:

1. **Generate only what's needed**
   - Skip hero generation if suitable image exists
   - Generate minimum gallery images (3-4, not 12)
   - Only generate for services without images

2. **Cache generated images**
   - Store in Supabase storage permanently
   - Reuse for same business if re-scraped

3. **Use efficient model**
   - `google/gemini-2.5-flash-image` for standard generation
   - `google/gemini-3-pro-image-preview` only for hero images (higher quality)

---

## Expected Results

### Before (No Images)
- Hero: Generic SVG pattern
- Gallery: Section hidden
- Services: Colored squares as placeholders

### After (AI Generated)
- Hero: Professional industry-specific interior/exterior shot
- Gallery: 4-6 relevant professional photos
- Services: Custom icons/images for each service

---

## Technical Summary

- **New edge function** for AI image generation with industry prompts
- **Supabase storage bucket** for generated images
- **Smart gap detection** to only generate what's missing
- **Prompt engineering** tailored to 60+ business types
- **Integrated UX** with progress feedback during generation
