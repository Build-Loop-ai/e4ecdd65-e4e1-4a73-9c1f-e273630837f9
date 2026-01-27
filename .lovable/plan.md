
# Intelligent Image Classification & Smart Fallback System

## Problem Summary
The screenshot shows critical issues with the generated websites:
1. **Wrong image placement** - A portrait photo (clearly an "about us" image) is placed as the hero background
2. **Text over text** - The original site's logo/branding text ("EVERYMAN'S AI") shows behind the new headline
3. **No smart fallbacks** - When no suitable hero image exists, we default to plain gradients

## Solution Overview

This plan introduces an **AI-powered image classification system** that analyzes each scraped image to understand its content and purpose, then routes images to the correct sections. For cases where no suitable hero image exists, we'll provide beautiful **business-type-specific pattern backgrounds**.

---

## Technical Implementation

### Part 1: Enhanced Image Classification in AI Processing

**File: `supabase/functions/process-content/index.ts`**

Update the AI prompt to classify every extracted image with semantic analysis:

```text
For EVERY image URL found, analyze and classify:

IMAGE CLASSIFICATION (CRITICAL):
{
  "url": "image_url_here",
  "classification": "hero" | "about" | "team" | "gallery" | "product" | "service" | "logo" | "unusable",
  "confidence": 0.0-1.0,
  "reasoning": "brief description of why",
  "hasText": true/false,  // Does the image contain embedded text/logos?
  "subjectType": "portrait" | "group" | "interior" | "exterior" | "product" | "abstract" | "food" | "action"
}

CLASSIFICATION RULES:
- "hero": Wide/landscape images of interiors, exteriors, or abstract visuals WITHOUT embedded text. Must be suitable as a full-width background.
- "about": Portraits of individuals, team headshots, founder photos
- "team": Group photos of multiple people
- "gallery": Work samples, portfolio pieces, finished products
- "product": Product photography, items for sale
- "service": Images showing services being performed
- "logo": Company logos, badges, icons
- "unusable": Images with heavy text overlays, poor quality, or icons

CRITICAL: Images with visible text/logos should NEVER be used as hero backgrounds (set "hasText": true)
```

The output schema will be updated to:
```json
{
  "hero": {
    "backgroundImages": ["only hero-classified images"],
    "fallbackPattern": "tech" | "beauty" | "food" | "legal" | "creative" | "medical" | "construction" | "retail" | "default"
  },
  "classifiedImages": [
    { "url": "...", "classification": "hero", "confidence": 0.9, "hasText": false },
    { "url": "...", "classification": "about", "confidence": 0.85, "hasText": false },
    ...
  ],
  "about": {
    "image": "first about-classified image (for split layouts)"
  }
}
```

---

### Part 2: Dynamic Pattern Generation System

**New File: `src/lib/heroPatterns.ts`**

Create a library of SVG-based, business-type-specific patterns that can be used as fallbacks:

| Business Type | Pattern Style |
|--------------|---------------|
| Technology | Circuit board / node network with gradient mesh |
| Beauty/Wellness | Soft organic curves, flowing lines |
| Food/Hospitality | Abstract culinary shapes, warm gradients |
| Legal/Professional | Clean geometric grid, subtle lines |
| Creative/Agency | Dynamic shapes, bold color blocks |
| Healthcare | Clean waves, calming gradients |
| Construction | Angular geometric patterns |
| Retail | Modern abstract shapes |

Each pattern will be dynamically colored using the extracted brand primary color.

```typescript
export type PatternType = 
  | 'tech-circuit' 
  | 'beauty-waves' 
  | 'food-organic' 
  | 'legal-grid' 
  | 'creative-blocks' 
  | 'medical-clean' 
  | 'construction-angular' 
  | 'retail-modern'
  | 'default-gradient';

export function getHeroPattern(
  patternType: PatternType, 
  primaryColor: string,
  templateId: TemplateId
): React.ReactNode;
```

---

### Part 3: Smart Hero Section Updates

**File: `src/components/preview/HeroSection.tsx`**

Update all template hero renderers to:

1. **Check image suitability** before using as background
2. **Apply pattern fallback** when no suitable image exists
3. **Never display text-over-text** scenarios

```typescript
// New logic flow
const suitableHeroImage = backgroundImages?.find(img => {
  // Only use images marked as hero-suitable
  const classification = classifiedImages?.find(c => c.url === img);
  return classification?.classification === 'hero' && !classification?.hasText;
});

// If no suitable image, use business-type pattern
if (!suitableHeroImage) {
  return <PatternHeroBackground 
    patternType={getPatternForIndustry(businessIntelligence.industry)}
    primaryColor={primaryColor}
    templateId={templateId}
  />;
}
```

---

### Part 4: About Section Image Support

**File: `src/components/preview/AboutSection.tsx`**

Add optional image support to About sections to use "about"-classified images:

- For templates with split layouts, display the portrait/team photo
- Ensure proper cropping and aspect ratio handling
- Add subtle animation on scroll

---

### Part 5: Fallback Pattern Component

**New File: `src/components/preview/PatternBackground.tsx`**

A reusable component that renders SVG-based patterns:

```typescript
interface PatternBackgroundProps {
  industry: IndustryType;
  primaryColor: string;
  templateId: TemplateId;
  className?: string;
}
```

Pattern examples:
- **Tech**: Animated node connections with subtle glow
- **Beauty**: Soft flowing curves that animate
- **Food**: Warm organic shapes
- **Legal**: Clean minimal grid lines
- **Default**: Sophisticated gradient mesh (similar to landing page hero)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/process-content/index.ts` | Modify | Add image classification prompts and structured output |
| `src/lib/heroPatterns.ts` | Create | Pattern type definitions and generation utilities |
| `src/lib/businessIntelligence.ts` | Modify | Add image classification types and helpers |
| `src/components/preview/PatternBackground.tsx` | Create | SVG pattern background component |
| `src/components/preview/HeroSection.tsx` | Modify | Integrate pattern fallbacks and image validation |
| `src/components/preview/AboutSection.tsx` | Modify | Add optional image support for portrait placement |

---

## Summary of Benefits

1. **Intelligent Image Placement**: AI classifies each image by content type, ensuring portraits go to About sections, not heroes
2. **No Text-Over-Text**: Images with embedded text/logos are flagged and excluded from background use
3. **Beautiful Fallbacks**: When no suitable hero image exists, business-appropriate animated patterns fill the space
4. **Brand Consistency**: Patterns use extracted brand colors for cohesive design
5. **Industry-Aware**: Different industries get different pattern styles that match their aesthetic
