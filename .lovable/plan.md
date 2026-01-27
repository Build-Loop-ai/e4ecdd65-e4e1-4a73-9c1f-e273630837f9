
# Smart Brand Color Extraction & Contrast Safety System

## Problem Summary

Based on my investigation, there are two critical issues:

1. **Brand colors not being properly extracted/identified** - The system relies on Firecrawl's `branding` format to extract colors, but this extraction is inconsistent. The AI doesn't actively analyze and identify the primary brand color from the scraped content.

2. **Dark text on dark backgrounds** - There's no systematic contrast validation. When a template uses a dark background (like `bold-starter` or `modern-professional`), and text colors aren't properly managed, you get unreadable text.

## Current Flow Analysis

```text
User enters URL
     ↓
Firecrawl scrapes with 'branding' format
     ↓
Returns: { branding: { colors: { primary, secondary, ... }, logo } }
     ↓
Passed to process-content edge function
     ↓
AI processes content BUT doesn't analyze/validate colors
     ↓
Colors stored in brand_colors column (often incomplete)
     ↓
Preview.tsx reads colors, passes to components
     ↓
Components use primaryColor directly without contrast checks
```

**Issues in this flow:**
- Firecrawl's branding extraction can fail or return null colors
- AI doesn't actively identify the brand's primary color from visual analysis
- No fallback color detection from logo, images, or meta tags
- Components use `primaryColor` for text without checking if it's readable against the background

---

## Solution Overview

### Part 1: Enhanced AI Color Intelligence

Update `process-content` to actively analyze and identify brand colors:

**File: `supabase/functions/process-content/index.ts`**

Add to the AI prompt:

```text
## BRAND COLOR ANALYSIS (CRITICAL)

Analyze the brand colors provided. If colors are missing or unclear:
1. Look for color mentions in CSS, metadata, or content
2. Identify the dominant brand color from descriptions
3. Ensure we have at least a PRIMARY color

Return validated brand colors:
{
  "brandColors": {
    "primary": "#hexcolor - the main brand color (REQUIRED)",
    "secondary": "#hexcolor or null",
    "accent": "#hexcolor or null", 
    "background": "#hexcolor - light or dark bg preference",
    "textPrimary": "#hexcolor - main text color",
    "colorScheme": "light" | "dark" - overall brand preference
  }
}

COLOR DETECTION RULES:
1. If Firecrawl extracted colors, validate they look like real brand colors
2. If primary is missing, infer from:
   - Logo colors mentioned
   - Common industry colors (tech=blue, food=red/orange, legal=navy)
   - Any hex colors found in content
3. Default to industry-appropriate colors if nothing found
```

### Part 2: Contrast Safety Utility

Create a utility for ensuring text is always readable.

**New File: `src/lib/colorContrast.ts`**

```typescript
// Calculate relative luminance
function getLuminance(hex: string): number;

// Calculate contrast ratio (WCAG formula)
function getContrastRatio(color1: string, color2: string): number;

// Ensure readable text color against background
export function getReadableTextColor(
  backgroundColor: string,
  preferredColor?: string
): string;

// Ensure CTA button text is readable
export function getButtonTextColor(buttonBgColor: string): string;

// Check if color combo passes WCAG AA (4.5:1 for text)
export function passesContrastCheck(
  textColor: string, 
  bgColor: string
): boolean;
```

### Part 3: Update Template Components with Contrast Safety

**Files to update:**
- `src/components/preview/HeroSection.tsx`
- `src/components/preview/ServicesSection.tsx`
- `src/components/preview/AboutSection.tsx`
- `src/components/preview/ContactSection.tsx`
- `src/components/preview/TestimonialsSection.tsx`
- `src/components/preview/GallerySection.tsx`

For each component, wrap text color decisions with contrast checks:

```typescript
import { getReadableTextColor, getButtonTextColor } from '@/lib/colorContrast';

// Before (dangerous - could be dark on dark):
<h1 className="text-foreground">{headline}</h1>

// After (safe - always readable):
<h1 style={{ color: getReadableTextColor(backgroundColor, primaryColor) }}>
  {headline}
</h1>

// CTA buttons:
<Button style={{ 
  backgroundColor: primaryColor,
  color: getButtonTextColor(primaryColor) 
}}>
```

### Part 4: Smart Color Fallbacks by Industry

**File: `src/lib/industryColors.ts`**

Define sensible default colors per industry when extraction fails:

| Industry | Primary | Secondary |
|----------|---------|-----------|
| Technology | #3B82F6 (blue) | #06B6D4 (cyan) |
| Beauty/Wellness | #EC4899 (pink) | #F472B6 |
| Food/Hospitality | #F97316 (orange) | #EF4444 (red) |
| Legal/Professional | #1E3A5F (navy) | #64748B |
| Healthcare | #14B8A6 (teal) | #22C55E |
| Construction | #D97706 (amber) | #78716C |
| Creative Agency | #8B5CF6 (purple) | #EC4899 |
| Retail | #6366F1 (indigo) | #F43F5E |
| Default | #6366F1 (indigo) | #64748B |

### Part 5: Preview Page Color Integration

**File: `src/pages/Preview.tsx`**

Update to use validated colors with fallbacks:

```typescript
import { getIndustryColors } from '@/lib/industryColors';

// Get colors with intelligent fallback
const getValidatedColors = () => {
  const brandColors = preview.brand_colors as any;
  const industry = businessIntelligence.industry;
  const fallbackColors = getIndustryColors(industry);
  
  return {
    primary: brandColors?.colors?.primary || 
             processedSchema?.brandColors?.primary || 
             fallbackColors.primary,
    secondary: brandColors?.colors?.secondary || 
               fallbackColors.secondary,
    // ... etc
  };
};
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/colorContrast.ts` | WCAG contrast utilities |
| `src/lib/industryColors.ts` | Industry-specific fallback colors |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/process-content/index.ts` | Add brand color analysis to AI prompt |
| `src/pages/Preview.tsx` | Use validated colors with fallbacks |
| `src/components/preview/HeroSection.tsx` | Add contrast safety for all text |
| `src/components/preview/ServicesSection.tsx` | Ensure text readability |
| `src/components/preview/AboutSection.tsx` | Ensure text readability |
| `src/components/preview/ContactSection.tsx` | Ensure text readability |
| `src/components/preview/TestimonialsSection.tsx` | Ensure text readability |
| `src/components/preview/GallerySection.tsx` | Ensure text readability |
| `src/components/preview/PatternBackground.tsx` | Use validated colors |

---

## Technical Details

### Contrast Calculation Algorithm

```typescript
// WCAG 2.1 relative luminance formula
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Contrast ratio (should be >= 4.5 for normal text)
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

### How Text Color Selection Works

```typescript
export function getReadableTextColor(
  backgroundColor: string,
  preferredColor?: string
): string {
  // If preferred color has good contrast, use it
  if (preferredColor && getContrastRatio(preferredColor, backgroundColor) >= 4.5) {
    return preferredColor;
  }
  
  // Otherwise, pick white or black based on background luminance
  const bgLuminance = getLuminance(backgroundColor);
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

---

## Summary of Benefits

1. **Reliable Brand Color Extraction** - AI actively identifies and validates brand colors, with industry-specific fallbacks when extraction fails

2. **Guaranteed Readable Text** - WCAG-compliant contrast checking ensures text is always visible regardless of template or brand colors

3. **Industry-Aware Defaults** - When brand colors can't be detected, sensible industry-appropriate colors are used

4. **No More Dark-on-Dark** - Every text element will be checked against its background before rendering
