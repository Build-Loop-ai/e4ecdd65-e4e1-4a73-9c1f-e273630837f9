

# Premium Template Overhaul: Bulletproof & Beautiful

## What We Found

After a thorough audit of all 5 templates and the full rendering pipeline, here's the current state and what needs fixing:

### Issues Found

1. **Dutch text fallbacks in Preview.tsx** (the main rendering page)
   - Line 144: "Preview niet gevonden" (should be "Preview not found")
   - Line 145: "Deze preview link is mogelijk ongeldig of verlopen" (should be "This preview link may be invalid or expired")
   - Line 248: Fallback headline "Welkom op uw nieuwe website" (should be "Welcome to your new website")
   - Line 249: Fallback subheadline "Een professionele online aanwezigheid voor uw bedrijf" (should be "A professional online presence for your business")
   - Line 250: Fallback CTA "Aan de slag" (should be "Get Started")

2. **Stale "pattern" comments and imports** in HeroSection.tsx
   - `FallbackPatternType` still imported and used as a prop (leftover from deleted pattern system)
   - Comments still say "Background - image or pattern" and "use pattern fallback"
   - These are cosmetic code issues but confusing for maintenance

3. **Robustness gaps** -- templates can break or look empty with edge-case input:
   - No graceful handling when `headline` or `subheadline` are empty strings
   - Gallery images with broken URLs show empty boxes before `onError` fires
   - Service cards with very long titles or descriptions overflow without truncation
   - Testimonials with extremely short quotes (edge case near the 20-char filter) can look odd
   - About section renders even with empty description
   - Contact section in some templates renders even with no contact info

4. **Visual polish opportunities**:
   - Service cards across templates lack hover glow borders (planned but not yet added)
   - Gallery hover effects are basic -- could add brightness + shadow lift
   - Section transitions could use smoother staggered timing
   - Corporate Classic services section has a hardcoded subtitle "Professional services tailored to your needs" -- should be dynamic or removed

## Implementation Plan

### Phase 1: Fix Remaining Dutch Text (Preview.tsx)

**File: `src/pages/Preview.tsx`**
- Translate the 404/not-found state (lines 144-145) to English
- Translate the 3 fallback props for HeroSection (lines 248-250)

### Phase 2: Clean Up Pattern Remnants (HeroSection.tsx)

**File: `src/components/preview/HeroSection.tsx`**
- Remove `FallbackPatternType` import (no longer used for anything)
- Remove `fallbackPattern` prop from the interface and destructuring
- Update comments from "pattern" to "gradient fallback"
- Update console.log message from "using pattern fallback" to "using gradient fallback"

**File: `src/pages/Preview.tsx`** and **`src/pages/Demo.tsx`**
- Remove the `fallbackPattern` prop from HeroSection usage (2 places)

### Phase 3: Robustness Improvements

**File: `src/components/preview/HeroSection.tsx`**
- Add fallback text for empty headlines: `headline || companyName || 'Welcome'`
- Add fallback text for empty subheadlines: `subheadline || 'Discover what we have to offer'`
- Add fallback CTA text: `ctaText || 'Learn More'`

**File: `src/components/preview/ServicesSection.tsx`**
- Add `line-clamp-2` to service titles and `line-clamp-3` to descriptions to prevent overflow
- Remove the hardcoded "Professional services tailored to your needs" subtitle from Corporate Classic (line 437-438) -- it's generic and doesn't adapt to the business
- Add image `onError` handlers to service card images so broken images hide gracefully

**File: `src/components/preview/GallerySection.tsx`**
- Add `loading="lazy"` to all gallery images for performance
- Add a subtle skeleton/placeholder state while images load

**File: `src/components/preview/AboutSection.tsx`**
- Add guard: don't render the section if both `description` and `valueProps` are empty/missing
- Add `line-clamp` safety on description text

**File: `src/components/preview/ContactSection.tsx`**
- Ensure ALL template variants (not just Elegant and Modern) return null when no contact info exists

### Phase 4: Visual Polish

**File: `src/components/preview/ServicesSection.tsx`**
- Add subtle hover glow border to Corporate Classic and Modern Professional cards:
  `hover:shadow-[0_0_20px_-5px] transition-shadow` using `primaryColor`
- Improve Warm Friendly card hover with a colored border transition

**File: `src/components/preview/GallerySection.tsx`**
- Add brightness boost on image hover: `group-hover:brightness-110`
- Add stronger shadow lift: `hover:shadow-2xl`

**File: `src/components/preview/TestimonialsSection.tsx`**
- Add auto-rotation timer to carousel-based testimonials (Corporate Classic, Elegant Minimal) so they cycle every 6 seconds without user interaction

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Preview.tsx` | Translate Dutch fallbacks, remove `fallbackPattern` prop |
| `src/pages/Demo.tsx` | Remove `fallbackPattern` prop |
| `src/components/preview/HeroSection.tsx` | Remove pattern imports/props, add text fallbacks, clean comments |
| `src/components/preview/ServicesSection.tsx` | Text clamping, remove generic subtitle, hover glow, image error handling |
| `src/components/preview/GallerySection.tsx` | Lazy loading, brightness hover, shadow lift |
| `src/components/preview/AboutSection.tsx` | Empty content guard |
| `src/components/preview/ContactSection.tsx` | Null render guard for all templates |
| `src/components/preview/TestimonialsSection.tsx` | Auto-rotation timer |

## No New Dependencies

Everything uses existing Framer Motion + Tailwind CSS.

