
# Intelligent Business-Aware Website Configuration

## The Problem
Currently, the system treats every business the same:
- A barber shop and a law firm get the same content schema
- Template selection is manual with no smart recommendations
- Section ordering is identical regardless of business type
- CTA text, headlines, and tone don't adapt to industry

## The Solution: AI-Powered Business Intelligence Layer

We'll add an **intelligent configuration system** that:
1. **Detects business type** from scraped content
2. **Recommends the best template** automatically
3. **Adapts content tone** to match the industry
4. **Customizes section ordering** based on what matters most for that business
5. **Generates industry-specific CTAs** and headlines

---

## Technical Implementation

### 1. Enhanced AI Processing - New Schema Fields

Update `supabase/functions/process-content/index.ts` to extract business intelligence:

**New fields to add to the processed schema:**

```json
{
  "businessIntelligence": {
    "industry": "beauty_wellness | food_hospitality | professional_services | creative_agency | retail_ecommerce | healthcare | construction_trades | technology | education | other",
    "businessType": "barber | salon | restaurant | cafe | law_firm | accounting | dentist | contractor | saas | agency | gym | spa | etc",
    "targetAudience": "local_consumers | businesses | luxury_clients | young_professionals | families | etc",
    "brandPersonality": "professional | friendly | luxury | edgy | traditional | modern | playful",
    "primaryAction": "book_appointment | call_now | get_quote | shop_now | learn_more | contact_us",
    "contentPriority": ["services", "portfolio", "testimonials", "about", "contact"],
    "recommendedTemplate": "corporate-classic | modern-professional | bold-starter | elegant-minimal | warm-friendly",
    "confidence": 0.85
  },
  "adaptedContent": {
    "hero": {
      "headline": "Industry-appropriate headline",
      "subheadline": "Tailored value proposition",
      "ctaText": "Book Your Appointment" // vs "Get Started" vs "Request Quote"
    },
    "sectionOrder": ["hero", "services", "gallery", "testimonials", "about", "contact"],
    "galleryTitle": "Our Work" | "Portfolio" | "Menu" | "Projects" | "Before & After",
    "servicesTitle": "Our Services" | "What We Offer" | "Menu" | "Treatments"
  }
}
```

### 2. Enhanced System Prompt

The AI will analyze the business and make intelligent decisions:

```text
BUSINESS INTELLIGENCE ANALYSIS:
1. Identify the INDUSTRY (beauty, food, professional services, creative, etc.)
2. Identify the specific BUSINESS TYPE (barber, restaurant, law firm, etc.)
3. Analyze the BRAND PERSONALITY from imagery, colors, and language
4. Determine the PRIMARY ACTION customers should take
5. Recommend which TEMPLATE best fits this business
6. Prioritize SECTIONS based on what matters most for this business type

INDUSTRY-SPECIFIC RULES:
- Barbers/Salons: Prioritize gallery (before/after), services with pricing hints, booking CTA
- Restaurants/Cafes: Prioritize menu/food gallery, ambiance photos, location/hours
- Law Firms/Accountants: Prioritize credentials, testimonials, about (trust), contact
- Creative Agencies: Prioritize portfolio, bold visuals, case studies
- Local Services (plumbers, etc.): Prioritize reviews, services, quick contact
- Luxury Brands: Prioritize whitespace, elegant imagery, exclusivity

TEMPLATE MATCHING:
- corporate-classic: Law firms, accountants, consultants, B2B services
- modern-professional: Tech companies, SaaS, digital agencies, startups
- bold-starter: Creative agencies, portfolios, design studios, artists
- elegant-minimal: Luxury brands, architects, high-end fashion, spas
- warm-friendly: Cafes, restaurants, local shops, family businesses, barbers
```

### 3. Dynamic Section Ordering

Update `src/pages/Preview.tsx` to respect `contentPriority`:

```typescript
// Instead of fixed order, use AI-recommended order
const sectionOrder = schema?.businessIntelligence?.contentPriority || 
  ['services', 'gallery', 'testimonials', 'about', 'contact'];

// Render sections in recommended order
{sectionOrder.map(section => renderSection(section))}
```

### 4. Industry-Specific Section Titles

Instead of hardcoded "Our Services", use adaptive titles:

| Business Type | Services Title | Gallery Title | CTA Text |
|--------------|----------------|---------------|----------|
| Barber/Salon | Treatments | Our Work | Book Now |
| Restaurant | Menu | Our Dishes | Reserve a Table |
| Law Firm | Practice Areas | Case Results | Schedule Consultation |
| Agency | What We Do | Portfolio | Start a Project |
| Contractor | Our Services | Recent Projects | Get a Quote |

### 5. Smart Template Auto-Selection

In `src/pages/NewPreview.tsx`, show the AI-recommended template as pre-selected with a "Recommended for [business type]" badge:

```tsx
{template === schema?.businessIntelligence?.recommendedTemplate && (
  <Badge className="absolute top-2 right-2 bg-green-500">
    Recommended for {schema?.businessIntelligence?.businessType}
  </Badge>
)}
```

### 6. Adaptive Color Treatment

Enhance `src/lib/templateStyles.ts` with industry-aware color adjustments:

```typescript
export interface IndustryColorHints {
  preferDark: boolean; // Tech/agencies prefer dark
  warmTones: boolean;  // Restaurants/cafes prefer warm
  highContrast: boolean; // Professional services need readability
  accentUsage: 'bold' | 'subtle' | 'accent-only';
}
```

---

## Files to Modify

1. **`supabase/functions/process-content/index.ts`**
   - Expand system prompt with business intelligence extraction
   - Add new schema fields for industry, business type, recommendations
   - Generate industry-appropriate content adaptations

2. **`src/lib/templateStyles.ts`**
   - Add industry mapping to templates
   - Add `industryFit` scores per template
   - Add section ordering preferences per template

3. **`src/pages/Preview.tsx`**
   - Implement dynamic section ordering from `contentPriority`
   - Use adapted section titles from schema
   - Pass industry context to section components

4. **`src/pages/NewPreview.tsx`**
   - Auto-select recommended template
   - Show "Recommended" badge on AI-suggested template
   - Display detected business type during template selection

5. **`src/components/preview/ServicesSection.tsx`**
   - Accept dynamic section title
   - Adjust layout based on industry (e.g., menu-style for restaurants)

6. **`src/components/preview/GallerySection.tsx`**
   - Accept dynamic section title
   - Adjust display style (before/after for salons, grid for portfolios)

7. **`src/components/preview/HeroSection.tsx`**
   - Use industry-appropriate CTA text
   - Adjust tone based on brand personality

---

## Expected Outcome

When you scrape ANY business website:

**Barber Shop** will automatically:
- Recommend "Warm Friendly" template
- Show "Our Work" gallery with before/after style
- Use "Book Your Appointment" CTA
- Prioritize: Services > Gallery > Testimonials > Contact

**Law Firm** will automatically:
- Recommend "Corporate Classic" template
- Show "Practice Areas" instead of "Services"
- Use "Schedule a Consultation" CTA
- Prioritize: About (trust) > Testimonials > Services > Contact

**Creative Agency** will automatically:
- Recommend "Bold Starter" template
- Show "Portfolio" with masonry layout
- Use "Start a Project" CTA
- Prioritize: Portfolio > Services > About > Contact

---

## Implementation Priority

1. **Phase 1**: Update `process-content` edge function with business intelligence extraction
2. **Phase 2**: Implement dynamic section ordering in Preview page
3. **Phase 3**: Add template auto-recommendation in NewPreview
4. **Phase 4**: Make section titles and CTAs adaptive
5. **Phase 5**: Fine-tune industry-specific layouts in section components
