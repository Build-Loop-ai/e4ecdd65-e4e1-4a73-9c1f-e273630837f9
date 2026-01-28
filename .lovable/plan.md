
# Fix Hero Image Text & Brand Color Intelligence

## Problems Identified

From your screenshot of SNIP BarberShop, I can see two critical issues:

### 1. Hero Image Has Embedded Text
The background shows "SNIP BARBERSHOP" in large gold letters - this is the business's own storefront/signage image being used as a hero background, causing visual conflict with the overlay content.

**Root cause**: The AI image classification system isn't correctly detecting that this image has text. The classification should mark `hasText: true`, which would prevent it from being used as a hero background.

### 2. Color Mismatch (Blue Button vs Gold Brand)
The CTA button uses a default blue (#3B82F6) instead of the gold/tan color from the business's logo and signage.

**Root cause**:
- Brand color extraction failed to detect the gold tone
- The industry fallback maps barbers to "beauty_wellness" → pink (#EC4899) - completely wrong for a masculine barbershop
- No logo-based color analysis exists

---

## Solution Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    INTELLIGENT COLOR SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. AI Extracts Brand Colors                                   │
│         ↓ (if fails)                                            │
│   2. Analyze Logo Dominant Color  ← NEW                         │
│         ↓ (if fails)                                            │
│   3. Industry-Specific Fallback (with barber palette) ← UPDATED │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Part 1: Stricter Image Text Detection

**File**: `supabase/functions/process-content/index.ts`

Update the AI prompt to be much stricter about text detection:

```text
CRITICAL TEXT DETECTION RULES:
1. If you can read ANY words in the image (business name, tagline, hours, prices), 
   mark hasText: TRUE and DO NOT classify as "hero"
2. Storefront photos with signage = hasText: true
3. Images with logos overlaid = hasText: true  
4. When in doubt, mark hasText: true (safer to show pattern than ugly text overlap)
5. Only pristine, text-free atmospheric shots should be "hero"
```

Also add explicit instruction to NEVER put text-containing images in `hero.backgroundImages[]`.

### Part 2: Add Logo Color Extraction

**New file**: `src/lib/logoColorExtraction.ts`

Create a utility to extract dominant color from logo images:

```typescript
// Extract dominant color from logo using canvas sampling
export async function extractLogoColor(logoUrl: string): Promise<string | null> {
  // Load image into canvas
  // Sample pixels and find dominant non-white/black color
  // Return hex color or null
}

// Determine if color is warm (gold, tan, orange) vs cool (blue, purple)
export function isWarmColor(hex: string): boolean {
  // Convert to HSL, check if hue is in warm range (0-60, 300-360)
}
```

**File**: `src/pages/Preview.tsx`

Add logo color as final fallback:

```typescript
const [logoExtractedColor, setLogoExtractedColor] = useState<string | null>(null);

useEffect(() => {
  if (logo && !aiColors?.primary && !firecrawlColors?.primary) {
    extractLogoColor(logo).then(setLogoExtractedColor);
  }
}, [logo, aiColors, firecrawlColors]);

// Updated priority chain:
const primaryColor = aiColors?.primary 
  || firecrawlColors?.primary 
  || logoExtractedColor           // ← NEW
  || industryFallback.primary;
```

### Part 3: Add Barber-Specific Color Palette

**File**: `src/lib/industryColors.ts`

Add distinct masculine palette for barbershops:

```typescript
// Barbershop - Traditional masculine, premium feel
barber: {
  primary: '#1F2937',    // Charcoal gray (classic)
  secondary: '#D4AF37',  // Gold accent
  accent: '#B8860B',     // Dark gold
  name: 'Barbershop',
},

// Also update beauty_wellness to be more general spa/salon focused
beauty_wellness: {
  primary: '#7C3AED',    // Purple (more unisex than pink)
  secondary: '#EC4899',  // Pink as secondary
  accent: '#F472B6',
  name: 'Beauty & Wellness',
},
```

Also update the matching logic:

```typescript
// Add specific barber detection BEFORE beauty fallback
if (normalized.includes('barber') || normalized.includes('kapper') || normalized.includes('herenkapper')) {
  return industryColors.barber;
}
```

### Part 4: Enhanced AI Color Instructions

**File**: `supabase/functions/process-content/index.ts`

Add logo color analysis to the AI prompt:

```text
LOGO COLOR ANALYSIS (when brand colors not found):
1. Analyze the logo image for dominant colors
2. Gold/tan logos → use #D4AF37 as primary
3. Navy/dark logos → use #1E3A5F as primary
4. Bright colored logos → use that hue as primary
5. Black/white logos → fall back to industry defaults

BARBER-SPECIFIC GUIDANCE:
- Barbershops are traditionally masculine businesses
- Prefer charcoal (#1F2937), navy (#1E3A5F), or gold (#D4AF37)
- NEVER use pink or pastel colors for barbershops
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/process-content/index.ts` | Stricter text detection rules, logo color analysis instructions, barber-specific guidance |
| `src/lib/industryColors.ts` | Add `barber` palette, improve matching logic for Dutch words (kapper) |
| `src/lib/logoColorExtraction.ts` | **NEW** - Extract dominant color from logo images |
| `src/pages/Preview.tsx` | Add logo color extraction as fallback |

---

## Expected Results

### Before (Current)
- Hero: Storefront image with "SNIP BARBERSHOP" text visible behind overlay
- Button: Blue (#3B82F6) - doesn't match brand

### After (Fixed)
- Hero: Either text-free interior/exterior shot OR elegant charcoal/gold pattern
- Button: Gold (#D4AF37) or charcoal matching the logo/signage color

---

## Summary

This fix addresses both issues at multiple levels:

1. **Stricter AI classification** prevents text-heavy images from being used as heroes
2. **Logo color extraction** pulls the gold tone directly from their branding
3. **Barber-specific palette** ensures masculine colors are used as fallback
4. **Dutch language support** recognizes "kapper" (barber) for proper industry matching
