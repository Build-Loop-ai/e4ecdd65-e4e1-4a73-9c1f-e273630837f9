
# Super Intelligent Business Detection System

## Overview

Transform the industry detection system from ~20 basic palettes to a comprehensive 60+ business type system with multilingual keyword matching, smart aliasing, and industry-specific color psychology.

## Current Limitations

| Issue | Impact |
|-------|--------|
| Only ~20 industry palettes | Many businesses get wrong fallback colors |
| Limited keyword matching | Dutch-only terms not recognized |
| No synonym system | "Tandarts" doesn't map to "dental" |
| Missing industries | Pet services, cleaning, event planning, etc. |
| Basic pattern fallbacks | Only 12 pattern types |

## Solution Architecture

```text
                    ┌──────────────────────────────────────────┐
                    │     SUPER INTELLIGENT DETECTION          │
                    ├──────────────────────────────────────────┤
                    │                                          │
  Input ───────────▶│  1. Multilingual Keyword Scanner         │
  "tandarts"        │     (NL/DE/FR/ES/EN)                    │
  "kapper"          │            ↓                             │
  "plumber"         │  2. Smart Alias Resolution               │
                    │     tandarts → dental                    │
                    │            ↓                             │
                    │  3. Industry Color Mapping               │
                    │     dental → teal/blue palette           │
                    │            ↓                             │
                    │  4. Pattern & Template Selection         │
                    │     healthcare → corporate-classic       │
                    │                                          │
                    └──────────────────────────────────────────┘
```

---

## Part 1: Expanded Industry Color Palettes (60+ Types)

### New Business Categories

**Personal Services (12 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Barbershop | #1F2937 (charcoal) | #D4AF37 (gold) | Masculine, premium |
| Hair Salon | #7C3AED (purple) | #EC4899 (pink) | Creative, feminine |
| Nail Studio | #F472B6 (pink) | #A855F7 (violet) | Glamorous |
| Tattoo Shop | #0F172A (black) | #EF4444 (red) | Edgy, bold |
| Spa/Wellness | #14B8A6 (teal) | #22C55E (green) | Calming, natural |
| Massage | #0D9488 (teal) | #6EE7B7 (mint) | Relaxing |
| Photography | #18181B (zinc) | #F59E0B (amber) | Artistic |
| Wedding Planner | #F9A8D4 (pink) | #D4AF37 (gold) | Romantic, elegant |
| Florist | #22C55E (green) | #EC4899 (pink) | Natural, beautiful |
| Pet Groomer | #3B82F6 (blue) | #F97316 (orange) | Friendly, playful |
| Dry Cleaner | #0EA5E9 (sky) | #64748B (slate) | Clean, professional |
| Tailor | #1E3A5F (navy) | #D4AF37 (gold) | Craftsmanship |

**Food & Hospitality (10 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Restaurant | #DC2626 (red) | #F97316 (orange) | Appetizing |
| Cafe/Coffee | #92400E (brown) | #D97706 (amber) | Warm, cozy |
| Bakery | #F59E0B (amber) | #92400E (brown) | Fresh, artisanal |
| Bar/Nightclub | #7C3AED (violet) | #EC4899 (pink) | Fun, nightlife |
| Fast Food | #EF4444 (red) | #FBBF24 (yellow) | Quick, energetic |
| Fine Dining | #1F2937 (charcoal) | #D4AF37 (gold) | Luxury |
| Food Truck | #F97316 (orange) | #22C55E (green) | Casual, fun |
| Catering | #6366F1 (indigo) | #F97316 (orange) | Professional |
| Ice Cream | #EC4899 (pink) | #06B6D4 (cyan) | Playful, sweet |
| Butcher | #991B1B (dark red) | #78716C (stone) | Traditional |

**Healthcare (8 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Dentist | #0D9488 (teal) | #3B82F6 (blue) | Trust, clean |
| Optician | #3B82F6 (blue) | #6366F1 (indigo) | Precision |
| Pharmacy | #22C55E (green) | #3B82F6 (blue) | Health |
| Physiotherapy | #14B8A6 (teal) | #F97316 (orange) | Active recovery |
| Veterinary | #22C55E (green) | #3B82F6 (blue) | Caring, natural |
| Psychologist | #7C3AED (purple) | #14B8A6 (teal) | Calm, trust |
| Chiropractor | #0D9488 (teal) | #64748B (slate) | Professional |
| Podiatrist | #14B8A6 (teal) | #64748B (slate) | Medical |

**Home Services (12 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Plumber | #3B82F6 (blue) | #64748B (slate) | Trust, reliable |
| Electrician | #F59E0B (amber) | #64748B (slate) | Safety, expert |
| HVAC | #06B6D4 (cyan) | #64748B (slate) | Comfort |
| Roofer | #78716C (stone) | #D97706 (amber) | Sturdy |
| Landscaper | #22C55E (green) | #92400E (brown) | Natural |
| Painter | #6366F1 (indigo) | #EC4899 (pink) | Creative |
| Locksmith | #1F2937 (charcoal) | #F59E0B (amber) | Security |
| Cleaning Service | #0EA5E9 (sky) | #22C55E (green) | Fresh, clean |
| Moving Company | #F97316 (orange) | #3B82F6 (blue) | Reliable |
| Interior Designer | #8B5CF6 (purple) | #D4AF37 (gold) | Luxury |
| Window Cleaner | #0EA5E9 (sky) | #E0F2FE (light blue) | Spotless |
| Pest Control | #22C55E (green) | #78716C (stone) | Safe |

**Professional Services (8 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Lawyer | #1E3A5F (navy) | #64748B (slate) | Trust, authority |
| Accountant | #1E3A5F (navy) | #059669 (emerald) | Precise |
| Insurance | #3B82F6 (blue) | #22C55E (green) | Security |
| Real Estate | #1F2937 (charcoal) | #D4AF37 (gold) | Premium |
| Notary | #1E3A5F (navy) | #78716C (stone) | Official |
| Architect | #18181B (zinc) | #F59E0B (amber) | Design |
| Consultant | #6366F1 (indigo) | #64748B (slate) | Expert |
| HR/Recruiting | #8B5CF6 (purple) | #3B82F6 (blue) | People-focused |

**Automotive (6 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Car Dealer | #1F2937 (charcoal) | #DC2626 (red) | Premium |
| Mechanic/Garage | #4B5563 (gray) | #D97706 (amber) | Reliable |
| Car Wash | #0EA5E9 (sky) | #3B82F6 (blue) | Clean |
| Tire Shop | #1F2937 (charcoal) | #F97316 (orange) | Durable |
| Auto Detailing | #18181B (zinc) | #D4AF37 (gold) | Premium |
| Motorcycle Shop | #0F172A (black) | #EF4444 (red) | Bold |

**Retail & Specialty (8 types)**
| Business | Primary | Secondary | Psychology |
|----------|---------|-----------|------------|
| Fashion Boutique | #18181B (zinc) | #EC4899 (pink) | Stylish |
| Jewelry Store | #D4AF37 (gold) | #18181B (zinc) | Luxury |
| Electronics | #3B82F6 (blue) | #06B6D4 (cyan) | Tech |
| Furniture Store | #78716C (stone) | #D97706 (amber) | Quality |
| Pet Store | #22C55E (green) | #F97316 (orange) | Friendly |
| Toy Store | #FBBF24 (yellow) | #EF4444 (red) | Fun |
| Bookstore | #92400E (brown) | #22C55E (green) | Knowledge |
| Music Store | #7C3AED (purple) | #EC4899 (pink) | Creative |

---

## Part 2: Multilingual Keyword Detection

### Keyword Alias Map (200+ terms)

```typescript
const BUSINESS_ALIASES: Record<string, string[]> = {
  // Barbershop - EN/NL/DE/FR/ES
  barber: ['barber', 'barbershop', 'kapper', 'herenkapper', 'friseur', 
           'herrenfriseur', 'coiffeur', 'barbier', 'barberia', 'peluquero'],
  
  // Hair Salon
  hair_salon: ['salon', 'hairdresser', 'kapsalon', 'dameskapper', 
               'friseursalon', 'coiffure', 'peluqueria', 'hairstylist'],
  
  // Dentist
  dentist: ['dentist', 'dental', 'tandarts', 'zahnarzt', 'dentiste', 
            'dentista', 'tandzorg', 'orthodontist', 'kieferorthopäde'],
  
  // Plumber
  plumber: ['plumber', 'plumbing', 'loodgieter', 'klempner', 'plombier',
            'fontanero', 'sanitair', 'riool', 'waterleiding'],
  
  // Restaurant
  restaurant: ['restaurant', 'eetcafé', 'bistro', 'brasserie', 'trattoria',
               'ristorante', 'restaurante', 'gasthof', 'eetgelegenheid'],
  
  // ...200+ more mappings
};
```

### Smart Detection Algorithm

```typescript
function detectBusiness(text: string): IndustryMatch {
  const normalized = text.toLowerCase();
  
  // 1. Exact business name matches
  for (const [industry, aliases] of Object.entries(BUSINESS_ALIASES)) {
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        return { industry, confidence: 0.95, matchedTerm: alias };
      }
    }
  }
  
  // 2. Domain-based detection (e.g., "tandarts-rotterdam.nl")
  const domainMatch = detectFromDomain(normalized);
  if (domainMatch) return domainMatch;
  
  // 3. Content pattern detection
  const patternMatch = detectFromPatterns(normalized);
  if (patternMatch) return patternMatch;
  
  return { industry: 'other', confidence: 0.3 };
}
```

---

## Part 3: Enhanced AI Prompt

Update `process-content` edge function with comprehensive business detection:

```text
## COMPREHENSIVE BUSINESS DETECTION

You are an expert at identifying business types from ANY country and language.

### BUSINESS TYPE MATRIX (60+ types)

PERSONAL SERVICES:
- barber/barbershop/kapper → barber palette (#1F2937 + #D4AF37)
- salon/kapsalon/coiffeur → hair_salon palette (#7C3AED + #EC4899)
- nail studio/nagelsalon → nail_studio palette (#F472B6)
- tattoo/tatoeage/tätowierer → tattoo palette (#0F172A + #EF4444)
- spa/wellness/sauna → spa palette (#14B8A6)
- massage/masseur → massage palette (#0D9488)
- photography/fotograaf/fotograf → photography palette (#18181B)
- florist/bloemist/floristik → florist palette (#22C55E)
- wedding planner/bruiloft → wedding palette (#F9A8D4)

HEALTHCARE:
- dentist/tandarts/zahnarzt/dentiste → dental palette (#0D9488 + #3B82F6)
- optician/opticien/optiker → optician palette (#3B82F6)
- physiotherapy/fysio/fysiotherapie → physio palette (#14B8A6)
- veterinary/dierenarts/tierarzt → vet palette (#22C55E)
- pharmacy/apotheek/apotheke → pharmacy palette (#22C55E)
- psychologist/psycholoog → psychology palette (#7C3AED)

HOME SERVICES:
- plumber/loodgieter/klempner → plumber palette (#3B82F6)
- electrician/elektricien/elektriker → electrician palette (#F59E0B)
- hvac/airco/klimaat → hvac palette (#06B6D4)
- roofer/dakdekker → roofer palette (#78716C)
- landscaping/hoveniersbedrijf/tuinman → landscaper palette (#22C55E)
- cleaning/schoonmaak/reinigung → cleaning palette (#0EA5E9)
- painter/schilder/maler → painter palette (#6366F1)
- locksmith/slotenmaker → locksmith palette (#1F2937)
- moving/verhuizer/umzug → moving palette (#F97316)

FOOD & HOSPITALITY:
- restaurant/eetcafe → restaurant palette (#DC2626)
- cafe/koffiehuis/coffee → cafe palette (#92400E)
- bakery/bakkerij/bäckerei → bakery palette (#F59E0B)
- bar/kroeg/nightclub → bar palette (#7C3AED)
- fine dining → fine_dining palette (#1F2937 + #D4AF37)
- catering → catering palette (#6366F1)
- ice cream/ijssalon → ice_cream palette (#EC4899)

PROFESSIONAL SERVICES:
- lawyer/advocaat/rechtsanwalt → lawyer palette (#1E3A5F)
- accountant/boekhouder → accountant palette (#1E3A5F)
- real estate/makelaar/immobilien → real_estate palette (#1F2937 + #D4AF37)
- insurance/verzekering → insurance palette (#3B82F6)
- notary/notaris → notary palette (#1E3A5F)
- architect → architect palette (#18181B)

AUTOMOTIVE:
- car dealer/autodealer/autohaus → car_dealer palette (#1F2937)
- mechanic/garage/werkplaats → mechanic palette (#4B5563)
- car wash/wasstraat → car_wash palette (#0EA5E9)
- tire shop/bandencentrale → tire_shop palette (#1F2937)

RETAIL:
- jewelry/juwelier → jewelry palette (#D4AF37)
- fashion/mode/boutique → fashion palette (#18181B)
- pet store/dierenwinkel → pet_store palette (#22C55E)
- electronics → electronics palette (#3B82F6)
- furniture/meubel → furniture palette (#78716C)
```

---

## Part 4: Implementation Files

| File | Changes |
|------|---------|
| `src/lib/industryColors.ts` | Expand from 20 to 60+ palettes, add alias system |
| `src/lib/businessIntelligence.ts` | Add new pattern types, industry mappings |
| `supabase/functions/process-content/index.ts` | Enhanced business detection prompt |

---

## Part 5: Example Detection Results

| Input | Detected Industry | Colors |
|-------|-------------------|--------|
| "Tandarts Amsterdam" | dental | Teal + Blue |
| "Loodgieter Zaandam" | plumber | Blue + Slate |
| "Bakkerij De Lekkerste" | bakery | Amber + Brown |
| "Advocatenkantoor Noord" | lawyer | Navy + Slate |
| "Garage Van der Berg" | mechanic | Gray + Amber |
| "Schoonmaakbedrijf Pro" | cleaning | Sky + Green |
| "Juwelier Diamant" | jewelry | Gold + Black |
| "Dierenarts de Zorg" | veterinary | Green + Blue |
| "Bruiloft Belle" | wedding | Pink + Gold |
| "Tattoo Studio X" | tattoo | Black + Red |

---

## Technical Summary

- **60+ industry color palettes** with psychology-based color selection
- **200+ keyword aliases** supporting NL/DE/FR/ES/EN
- **Smart cascade detection**: keywords → domain → patterns → AI
- **Industry-specific templates** and section ordering
- **Consistent fallback patterns** for every business type
