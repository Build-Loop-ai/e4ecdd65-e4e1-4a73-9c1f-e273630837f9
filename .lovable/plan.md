
# Adding 3 New Templates - Distinct Styles for Different Business Types

## Overview
Add 3 new carefully designed templates that cater to different business types and aesthetic preferences. Each template will have a distinct visual identity while using the same modular section components with template-specific variations.

## Current State
- **2 templates**: `modern-professional` (dark/gradient) and `corporate-classic` (clean/traditional)
- Templates are differentiated by an `isModern` boolean flag
- Section components accept `isModern` and `primaryColor` props for styling variations
- Template selection shows live mini-previews with actual scraped content

## The 3 New Templates

### 1. Bold Starter (`bold-starter`)
**Target audience**: Startups, tech companies, creative agencies, bold personal brands

**Visual characteristics**:
- Full-bleed hero sections with large typography
- Vibrant gradient backgrounds (using primary + accent colors)
- Asymmetric layouts and overlapping elements
- Large, bold headlines with gradient text effects
- Floating animated elements and glassmorphism cards
- Dark mode feel with neon accent highlights

**Key differentiators**:
- Text gradients using brand colors
- Services displayed as floating cards with glassmorphism
- Testimonials with large quote marks and bold typography
- Contact section with animated background elements

### 2. Elegant Minimal (`elegant-minimal`)
**Target audience**: Luxury brands, photographers, architects, high-end services, wellness/spa

**Visual characteristics**:
- Maximum whitespace, minimal elements
- Thin typography, serif fonts for headings
- Subtle, refined animations (fade + slight movement)
- Muted color palette with single accent color
- Full-width images with minimal overlays
- Clean lines and geometric accents

**Key differentiators**:
- Light backgrounds with subtle texture
- Services in a clean single-column layout
- Gallery with generous spacing between images
- Contact section with elegant typography

### 3. Warm Friendly (`warm-friendly`)
**Target audience**: Cafes, restaurants, local businesses, family services, healthcare, education

**Visual characteristics**:
- Warm, inviting color treatment (soft gradients)
- Rounded corners everywhere
- Friendly, approachable typography
- Soft shadows and warm highlights
- Photos with warm filters/overlays
- Personal, welcoming feel

**Key differentiators**:
- Rounded cards with soft shadows
- Services in a cozy grid layout with icons
- Testimonials with avatar photos
- Contact with a friendly "come visit us" feel

## Technical Implementation

### Phase 1: Update Template Type System

**Modify: `src/pages/Preview.tsx`**
- Replace `isModern` boolean with a `templateStyle` string
- Add template-specific style configuration object
- Pass template style to all section components

**Create: `src/lib/templateStyles.ts`**
- Define template configurations with:
  - Layout variations (section arrangements)
  - Typography styles (font weights, sizes)
  - Animation presets
  - Color treatment rules
  - Border radius values
  - Background patterns

### Phase 2: Update Section Components

Each section component needs to handle 5 template styles:

**Modify: `src/components/preview/HeroSection.tsx`**
- `modern-professional`: Current dark gradient with orbs
- `corporate-classic`: Clean image with overlay
- `bold-starter`: Full gradient background, gradient text headlines, floating elements
- `elegant-minimal`: Large whitespace, thin serif headline, subtle fade-in
- `warm-friendly`: Soft gradient overlay, rounded CTA, warm tones

**Modify: `src/components/preview/AboutSection.tsx`**
- `bold-starter`: Asymmetric layout, gradient accent bar
- `elegant-minimal`: Centered, serif headings, maximum whitespace
- `warm-friendly`: Rounded corners, soft shadows, icon accents

**Modify: `src/components/preview/ServicesSection.tsx`**
- `bold-starter`: Glassmorphism cards, neon borders on hover
- `elegant-minimal`: Single column, minimal cards, thin borders
- `warm-friendly`: Soft rounded cards with icons, warm shadows

**Modify: `src/components/preview/ContactSection.tsx`**
- `bold-starter`: Dark background with animated gradient
- `elegant-minimal`: Light background, thin typography, centered
- `warm-friendly`: Warm background, rounded buttons, friendly copy

**Modify: `src/components/preview/HorizontalGallery.tsx`**
- `bold-starter`: Overlapping images, gradient overlays
- `elegant-minimal`: Large spacing, subtle shadows
- `warm-friendly`: Soft rounded corners, warm filter

**Modify: `src/components/preview/TestimonialsSection.tsx`**
- `bold-starter`: Large quote marks, gradient accents
- `elegant-minimal`: Clean cards, subtle typography
- `warm-friendly`: Avatar photos, rounded cards, warm background

### Phase 3: Update Template Selection UI

**Modify: `src/pages/NewPreview.tsx`**
- Add 3 new template cards with live content previews
- Arrange in a 2x3 or 3x2 grid for better selection
- Each card shows template's unique visual style:
  - Bold Starter: Gradient background, bold text
  - Elegant Minimal: White/cream, thin text, lots of space
  - Warm Friendly: Soft colors, rounded elements

**Modify: `src/components/manage/ManageToolbar.tsx`**
- Add 3 new options to template dropdown
- Update labels: "Bold", "Elegant", "Warm"

**Modify: `src/components/manage/QuickEdit.tsx`**
- Add 3 new template selection buttons
- Show appropriate visual preview for each

**Modify: `src/pages/Dashboard.tsx`**
- Update template label display to show all 5 template names

## Template Style Configuration

```text
TEMPLATE_STYLES = {
  'modern-professional': {
    name: 'Modern Professional',
    shortName: 'Modern',
    description: 'Contemporary design with gradient accents',
    hero: { dark: true, gradientOrbs: true },
    borderRadius: 'rounded-xl',
    fontWeight: 'bold',
  },
  'corporate-classic': {
    name: 'Corporate Classic',
    shortName: 'Classic',
    description: 'Traditional, professional corporate styling',
    hero: { dark: true, imageOverlay: true },
    borderRadius: 'rounded-lg',
    fontWeight: 'semibold',
  },
  'bold-starter': {
    name: 'Bold Starter',
    shortName: 'Bold',
    description: 'Vibrant gradients for startups and creatives',
    hero: { dark: true, fullGradient: true, gradientText: true },
    borderRadius: 'rounded-2xl',
    fontWeight: 'black',
  },
  'elegant-minimal': {
    name: 'Elegant Minimal',
    shortName: 'Elegant',
    description: 'Refined luxury with maximum whitespace',
    hero: { dark: false, serif: true },
    borderRadius: 'rounded-sm',
    fontWeight: 'light',
  },
  'warm-friendly': {
    name: 'Warm Friendly',
    shortName: 'Warm',
    description: 'Approachable design for local businesses',
    hero: { dark: false, warmOverlay: true },
    borderRadius: 'rounded-3xl',
    fontWeight: 'medium',
  },
}
```

## Files to Create

1. **`src/lib/templateStyles.ts`**
   - Template configuration object
   - Helper functions for getting template-specific styles
   - Type definitions for template IDs

## Files to Modify

1. **`src/pages/Preview.tsx`**
   - Import template styles
   - Pass template style to all sections

2. **`src/components/preview/HeroSection.tsx`**
   - Add `templateId` prop
   - Implement 5 visual variations

3. **`src/components/preview/AboutSection.tsx`**
   - Add `templateId` prop
   - Implement layout/style variations

4. **`src/components/preview/ServicesSection.tsx`**
   - Add `templateId` prop
   - Implement card style variations

5. **`src/components/preview/ContactSection.tsx`**
   - Add `templateId` prop
   - Implement style variations

6. **`src/components/preview/HorizontalGallery.tsx`**
   - Add `templateId` prop
   - Implement spacing/style variations

7. **`src/components/preview/TestimonialsSection.tsx`**
   - Add `templateId` prop
   - Implement card style variations

8. **`src/pages/NewPreview.tsx`**
   - Add 3 new template mini-previews
   - Update grid layout for 5 templates

9. **`src/components/manage/ManageToolbar.tsx`**
   - Add 3 new template options

10. **`src/components/manage/QuickEdit.tsx`**
    - Add 3 new template buttons

11. **`src/pages/Dashboard.tsx`**
    - Update template label mapping

## Visual Summary of Templates

```text
+-------------------+-------------------+-------------------+
|  MODERN PROF.     |  CORPORATE CLASSIC|  BOLD STARTER     |
|  Dark + Gradients |  Clean + Image BG |  Vibrant Gradients|
|  Tech/Agency      |  Business/Corp    |  Startup/Creative |
+-------------------+-------------------+-------------------+
|  ELEGANT MINIMAL  |  WARM FRIENDLY    |
|  White + Serif    |  Soft + Rounded   |
|  Luxury/Design    |  Local/Family Biz |
+-------------------+-------------------+
```

## Template Mini-Preview Visual Differences

In the selection UI, each template preview will show:

- **Bold Starter**: Gradient background (primary->secondary), large white text, floating elements
- **Elegant Minimal**: Cream/white background, thin centered text, lots of padding
- **Warm Friendly**: Soft warm gradient, rounded corners everywhere, friendly feel

## Expected Result
Users will have 5 distinct template options that cover a wide range of business types:
1. Tech companies and agencies (Modern Professional)
2. Traditional businesses (Corporate Classic)
3. Startups and creatives (Bold Starter)
4. Luxury and design brands (Elegant Minimal)
5. Local and family businesses (Warm Friendly)

Each template uses the same scraped content but presents it with a completely different visual personality.
