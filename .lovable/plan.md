
# Dynamic Content Display - Intelligent Section Rendering

## Overview
Make the preview generation smarter by only showing sections when there's meaningful content. This creates a cleaner, more professional result by hiding empty or insufficient data sections.

## Current Situation
- **TestimonialsSection**: Shows if there are any testimonials (even just 1)
- **InstagramFeed**: Already filters for valid posts but shows with just 1 post
- **HorizontalGallery**: Shows if there are valid images (minimum 1)
- **Services**: Always shows (no minimum check)

## What Changes

### 1. Update AI Prompt for Smarter Extraction
Modify `supabase/functions/process-content/index.ts`:
- Add explicit instructions to the AI: "Only include testimonials if 2 or more genuine customer reviews are found"
- Add instruction: "Only include Instagram posts if a real Instagram feed embed is detected"
- Instruct AI to return empty arrays (not fabricated content) when data isn't found

### 2. Frontend Conditional Logic
Update `src/components/preview/TestimonialsSection.tsx`:
- Change minimum threshold from 1 to 2 testimonials
- Add validation that testimonials have actual content (not placeholder text)

Update `src/components/preview/InstagramFeed.tsx`:
- Require minimum 3 valid Instagram posts to display the section
- Add better image URL validation

Update `src/components/preview/HorizontalGallery.tsx`:
- Require minimum 3 images to show the gallery section (1-2 images looks sparse)

Update `src/components/preview/ServicesSection.tsx`:
- Require minimum 2 services to show the section

### 3. Add Content Quality Validation
In `src/pages/Preview.tsx`:
- Pre-filter testimonials to remove any with suspiciously short quotes or generic content
- Pre-filter Instagram posts to ensure they have valid image URLs
- Log what sections are being shown/hidden for debugging

## Technical Implementation

### TestimonialsSection.tsx Changes
```text
Current: if (!testimonials || testimonials.length === 0) return null;
New:     if (!testimonials || testimonials.length < 2) return null;
         + Filter out testimonials with quotes shorter than 20 characters
```

### InstagramFeed.tsx Changes
```text
Current: Shows with any valid posts
New:     Require minimum 3 valid posts with working image URLs
```

### HorizontalGallery.tsx Changes
```text
Current: Shows with any valid images
New:     Require minimum 3 valid images
```

### ServicesSection.tsx Changes
```text
Current: Shows all services
New:     Require minimum 2 services to display section
```

### process-content AI Prompt Updates
Add these instructions to system prompt:
- "CRITICAL: Only include testimonials if you find 2+ genuine, distinct customer reviews with real names. If fewer reviews exist, return an empty testimonials array."
- "CRITICAL: Only include Instagram data if the website has a visible Instagram feed embed. Do not fabricate Instagram posts."
- "Do not invent or fabricate any content. Only extract what actually exists on the page."

## Files to Modify
1. `supabase/functions/process-content/index.ts` - Stricter AI extraction rules
2. `src/components/preview/TestimonialsSection.tsx` - Minimum 2 testimonials
3. `src/components/preview/InstagramFeed.tsx` - Minimum 3 posts
4. `src/components/preview/HorizontalGallery.tsx` - Minimum 3 images
5. `src/components/preview/ServicesSection.tsx` - Minimum 2 services

## Expected Result
- Websites with only 1 review: No testimonials section shown
- Websites without Instagram: No Instagram section shown
- Sparse galleries: Hidden if fewer than 3 images
- Single service businesses: Integrate service info into About section instead

This creates a polished, professional preview that only shows sections with meaningful content!
