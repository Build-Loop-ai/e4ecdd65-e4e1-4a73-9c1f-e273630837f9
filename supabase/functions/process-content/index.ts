const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('process-content started');
    const { scrapedContent, brandColors } = await req.json();
    console.log('Payload received - markdown length:', scrapedContent?.markdown?.length || 0);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert at analyzing scraped website content and organizing it into a structured schema for a premium, high-end website template.

## LANGUAGE DETECTION (CRITICAL - DO THIS FIRST)

Detect the language of the source website from its content (headings, paragraphs, metadata, navigation).
ALL generated text (headlines, section titles, CTAs, descriptions, value propositions, stat labels)
MUST be in the SAME language as the source website.

DEFAULT LANGUAGE IS ENGLISH. If you cannot clearly determine the language, USE ENGLISH.
- If the website is clearly in Dutch (most content is Dutch), output Dutch.
- If the website is clearly in German (most content is German), output German.
- If the website is in any other non-English language AND the majority of content is in that language, use that language.
- If the website mixes languages, is ambiguous, or is primarily in English, USE ENGLISH.
- Websites from non-English-speaking countries (e.g., Indonesia, Bali, Thailand) that have English content MUST get English output.
NEVER default to Dutch. The safe default is ALWAYS English.
Include a "detectedLanguage" field in your response (e.g. "en", "nl", "de", "fr", "es").

## BRAND COLOR ANALYSIS (CRITICAL)

Analyze the brand colors provided from Firecrawl. This is ESSENTIAL for maintaining brand consistency.

If Firecrawl extracted colors, validate and use them. If colors are missing or incomplete:
1. Look for color mentions in CSS, metadata, or content
2. Analyze the brand personality to infer appropriate colors
3. Use the COMPREHENSIVE INDUSTRY COLOR PALETTE below

You MUST return validated brand colors in this format:
{
  "brandColors": {
    "primary": "#hexcolor - the main brand color (REQUIRED - this is the most important color)",
    "secondary": "#hexcolor or null - supporting color",
    "accent": "#hexcolor or null - accent for CTAs/highlights",
    "background": "#hexcolor - suggested background (light or dark)",
    "textPrimary": "#hexcolor - main text color",
    "colorScheme": "light" | "dark" - overall brand preference
  }
}

COLOR DETECTION RULES:
1. If Firecrawl provided colors.primary, use it as the base but validate it looks like a real brand color
2. If primary is missing, look for:
   - Colors in the logo description
   - Dominant colors mentioned in CSS snippets
   - Use the 60+ industry color palette below
3. NEVER return null for primary - always provide a valid hex color
4. If the brand uses dark colors predominantly, set colorScheme to "dark"

LOGO COLOR ANALYSIS (when brand colors not found):
1. Analyze the logo image for dominant colors
2. Gold/tan logos → use #D4AF37 as primary
3. Navy/dark logos → use #1E3A5F as primary
4. Bright colored logos → use that hue as primary
5. Black/white logos → fall back to industry defaults

## COMPREHENSIVE INDUSTRY COLOR PALETTE (60+ business types)

MULTILINGUAL KEYWORD DETECTION - Recognize these terms in ANY language:

### PERSONAL SERVICES
| Business Type | Keywords (EN/NL/DE/FR/ES) | Primary | Secondary |
|--------------|---------------------------|---------|-----------|
| Barber | barber, barbershop, kapper, herenkapper, friseur, barbier, barberia | #1F2937 (charcoal) | #D4AF37 (gold) |
| Hair Salon | salon, hairdresser, kapsalon, dameskapper, coiffure, peluqueria | #7C3AED (purple) | #EC4899 (pink) |
| Nail Studio | nail, nails, nagel, nagelsalon, manucure, manicura | #F472B6 (pink) | #A855F7 (violet) |
| Tattoo | tattoo, tatoeage, tätowierer, tatouage, tatuaje | #0F172A (black) | #EF4444 (red) |
| Spa/Wellness | spa, wellness, sauna, wellnesscentrum, therme | #14B8A6 (teal) | #22C55E (green) |
| Massage | massage, masseur, massagesalon | #0D9488 (teal) | #6EE7B7 (mint) |
| Photography | photography, fotografie, fotograaf, photographe | #18181B (zinc) | #F59E0B (amber) |
| Wedding | wedding, bruiloft, hochzeit, mariage, boda | #F9A8D4 (pink) | #D4AF37 (gold) |
| Florist | florist, flowers, bloemen, bloemist, fleuriste, florista | #22C55E (green) | #EC4899 (pink) |
| Pet Groomer | grooming, trimsalon, hundesalon, toilettage | #3B82F6 (blue) | #F97316 (orange) |
| Dry Cleaner | dry cleaning, stomerij, reinigung, pressing, tintorería | #0EA5E9 (sky) | #64748B (slate) |
| Tailor | tailor, kleermaker, schneider, tailleur, sastre | #1E3A5F (navy) | #D4AF37 (gold) |

### FOOD & HOSPITALITY
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Restaurant | restaurant, eetcafé, gaststätte, brasserie | #DC2626 (red) | #F97316 (orange) |
| Cafe | cafe, coffee, koffie, koffiehuis, café | #92400E (brown) | #D97706 (amber) |
| Bakery | bakery, bakkerij, bäckerei, boulangerie, panadería | #F59E0B (amber) | #92400E (brown) |
| Bar/Nightclub | bar, pub, kroeg, nightclub, discotheek | #7C3AED (violet) | #EC4899 (pink) |
| Fast Food | fast food, snackbar, imbiss, restauration rapide | #EF4444 (red) | #FBBF24 (yellow) |
| Fine Dining | fine dining, gourmet, sterrenrestaurant, michelin | #1F2937 (charcoal) | #D4AF37 (gold) |
| Food Truck | food truck, foodtruck, streetfood | #F97316 (orange) | #22C55E (green) |
| Catering | catering, traiteur, partyservice | #6366F1 (indigo) | #F97316 (orange) |
| Ice Cream | ice cream, ijs, ijssalon, eiscafé, heladería | #EC4899 (pink) | #06B6D4 (cyan) |
| Butcher | butcher, slager, metzger, boucher, carnicero | #991B1B (dark red) | #78716C (stone) |

### HEALTHCARE
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Dentist | dentist, dental, tandarts, zahnarzt, dentiste | #0D9488 (teal) | #3B82F6 (blue) |
| Optician | optician, opticien, optiker, lunettes, óptico | #3B82F6 (blue) | #6366F1 (indigo) |
| Pharmacy | pharmacy, apotheek, apotheke, pharmacie, farmacia | #22C55E (green) | #3B82F6 (blue) |
| Physiotherapy | physio, fysiotherapie, physiotherapie, kinésithérapie | #14B8A6 (teal) | #F97316 (orange) |
| Veterinary | vet, dierenarts, tierarzt, vétérinaire, veterinario | #22C55E (green) | #3B82F6 (blue) |
| Psychologist | psychologist, psycholoog, psychologe, thérapeute | #7C3AED (purple) | #14B8A6 (teal) |
| Chiropractor | chiropractor, chiropractie, chiropraktiker | #0D9488 (teal) | #64748B (slate) |

### HOME SERVICES
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Plumber | plumber, loodgieter, klempner, plombier, fontanero | #3B82F6 (blue) | #64748B (slate) |
| Electrician | electrician, elektricien, elektriker, électricien | #F59E0B (amber) | #64748B (slate) |
| HVAC | hvac, airco, klimaat, heating, climatisation | #06B6D4 (cyan) | #64748B (slate) |
| Roofer | roofer, dakdekker, dachdecker, couvreur, techador | #78716C (stone) | #D97706 (amber) |
| Landscaper | landscaper, hovenier, tuinman, gärtner, jardinero | #22C55E (green) | #92400E (brown) |
| Painter | painter, schilder, maler, peintre, pintor | #6366F1 (indigo) | #EC4899 (pink) |
| Locksmith | locksmith, slotenmaker, schlüsseldienst, serrurier | #1F2937 (charcoal) | #F59E0B (amber) |
| Cleaning | cleaning, schoonmaak, reinigung, nettoyage, limpieza | #0EA5E9 (sky) | #22C55E (green) |
| Moving | moving, verhuizen, umzug, déménagement, mudanza | #F97316 (orange) | #3B82F6 (blue) |
| Interior Design | interior, interieur, innenarchitekt, décorateur | #8B5CF6 (purple) | #D4AF37 (gold) |
| Pest Control | pest control, ongediertebestrijding, schädlingsbekämpfung | #22C55E (green) | #78716C (stone) |

### PROFESSIONAL SERVICES
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Lawyer | lawyer, attorney, advocaat, rechtsanwalt, avocat, abogado | #1E3A5F (navy) | #64748B (slate) |
| Accountant | accountant, boekhouder, buchhalter, comptable, contador | #1E3A5F (navy) | #059669 (emerald) |
| Insurance | insurance, verzekering, versicherung, assurance, seguros | #3B82F6 (blue) | #22C55E (green) |
| Real Estate | real estate, makelaar, immobilien, immobilier, inmobiliaria | #1F2937 (charcoal) | #D4AF37 (gold) |
| Notary | notary, notaris, notar, notaire, notario | #1E3A5F (navy) | #78716C (stone) |
| Architect | architect, architectuur, architektur, architecte, arquitecto | #18181B (zinc) | #F59E0B (amber) |
| Consultant | consultant, adviseur, berater, conseil, consultor | #6366F1 (indigo) | #64748B (slate) |

### AUTOMOTIVE
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Car Dealer | car dealer, autodealer, autohaus, concessionnaire | #1F2937 (charcoal) | #DC2626 (red) |
| Mechanic | mechanic, garage, autowerkplaats, werkstatt, taller | #4B5563 (gray) | #D97706 (amber) |
| Car Wash | car wash, wasstraat, waschanlage, lavage auto | #0EA5E9 (sky) | #3B82F6 (blue) |
| Tire Shop | tire, banden, reifen, pneus, neumáticos | #1F2937 (charcoal) | #F97316 (orange) |
| Auto Detailing | detailing, autopoetsen, autopflege | #18181B (zinc) | #D4AF37 (gold) |
| Motorcycle | motorcycle, motor, motorrad, moto | #0F172A (black) | #EF4444 (red) |

### RETAIL
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Fashion | fashion, mode, kleding, bekleidung, vêtements, moda | #18181B (zinc) | #EC4899 (pink) |
| Jewelry | jewelry, juwelier, schmuck, bijouterie, joyería | #D4AF37 (gold) | #18181B (zinc) |
| Electronics | electronics, elektronica, elektronik, électronique | #3B82F6 (blue) | #06B6D4 (cyan) |
| Furniture | furniture, meubels, möbel, meubles, muebles | #78716C (stone) | #D97706 (amber) |
| Pet Store | pet store, dierenwinkel, tierhandlung, animalerie | #22C55E (green) | #F97316 (orange) |

### TECHNOLOGY
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Technology | tech, software, it, digital, ict | #3B82F6 (blue) | #06B6D4 (cyan) |
| SaaS | saas, cloud, platform | #6366F1 (indigo) | #3B82F6 (blue) |

### FITNESS & EDUCATION
| Business Type | Keywords | Primary | Secondary |
|--------------|----------|---------|-----------|
| Fitness/Gym | fitness, gym, sportschool, fitnessstudio | #DC2626 (red) | #F97316 (orange) |
| Yoga | yoga, pilates, yogastudio | #14B8A6 (teal) | #F472B6 (pink) |
| Education | education, school, onderwijs, bildung, éducation | #2563EB (blue) | #16A34A (green) |
| Driving School | driving school, rijschool, fahrschule, auto-école | #22C55E (green) | #3B82F6 (blue) |

CRITICAL RULES FOR COLOR SELECTION:
1. ALWAYS detect the exact business type first using keywords in ANY language
2. Use the EXACT colors from the palette above - do not improvise
3. NEVER use pink (#EC4899, #F472B6) for masculine businesses (barbers, mechanics, gyms)
4. NEVER use charcoal/black (#1F2937, #0F172A) for feminine businesses (nail studios, spas)
5. When in doubt, use the industry's standard professional color

## BUSINESS INTELLIGENCE ANALYSIS (CRITICAL - DO THIS FIRST)

Before extracting content, you MUST analyze the business to determine:

1. **INDUSTRY** - Classify into one of these categories:
   - beauty_wellness (barbers, salons, spas, nail studios, tattoo shops)
   - food_hospitality (restaurants, cafes, bars, bakeries, catering, hotels)
   - professional_services (law firms, accounting, consulting, real estate, insurance)
   - creative_agency (design studios, marketing agencies, photography, video production)
   - retail_ecommerce (shops, boutiques, online stores)
   - healthcare (doctors, dentists, clinics, therapists, chiropractors)
   - construction_trades (contractors, plumbers, electricians, roofers, landscaping)
   - technology (SaaS, software, IT services, tech startups)
   - education (schools, tutoring, training, courses)
   - fitness_sports (gyms, personal trainers, yoga studios, sports clubs)
   - automotive (car dealers, mechanics, auto detailing)
   - other

2. **BUSINESS TYPE** - Specific type (e.g., "barber", "law_firm", "italian_restaurant", "dentist", etc.)

3. **TARGET AUDIENCE** - Who are their customers?
   - local_consumers, businesses, luxury_clients, young_professionals, families, etc.

4. **BRAND PERSONALITY** - Analyze from their imagery, colors, and language:
   - professional, friendly, luxury, edgy, traditional, modern, playful, sophisticated

5. **PRIMARY ACTION** - What should visitors do?
   - book_appointment, call_now, get_quote, shop_now, learn_more, contact_us, reserve_table, schedule_consultation

6. **RECOMMENDED TEMPLATE** - Based on business type, choose the BEST fit:
   - corporate-classic: Law firms, accountants, consultants, B2B services, insurance, real estate
   - modern-professional: Tech companies, SaaS, digital agencies, IT services, startups
   - bold-starter: Creative agencies, design studios, artists, photographers, marketing agencies
   - elegant-minimal: Luxury brands, architects, high-end fashion, premium spas, fine dining
   - warm-friendly: Cafes, restaurants, local shops, family businesses, barbers, bakeries, gyms

7. **CONTENT PRIORITY** - Order sections by importance for this business type:
   - Barbers/Salons: ["services", "gallery", "testimonials", "about", "contact"]
   - Restaurants: ["gallery", "services", "about", "testimonials", "contact"] (gallery = food photos, services = menu)
   - Law Firms: ["about", "services", "testimonials", "gallery", "contact"]
   - Creative Agencies: ["gallery", "services", "about", "testimonials", "contact"]
   - Healthcare: ["services", "about", "testimonials", "gallery", "contact"]
   - Tech/SaaS: ["services", "about", "testimonials", "gallery", "contact"]

## IMAGE CLASSIFICATION (CRITICAL)

For EVERY image URL found, you MUST analyze and classify it. This is essential for proper image placement.

CLASSIFICATION CATEGORIES:
- "hero": Wide/landscape images of interiors, exteriors, or abstract visuals WITHOUT ANY embedded text/logos. Must be suitable as a full-width background. High-quality atmospheric shots ONLY.
- "about": Portraits of individuals, headshots, founder photos, single person professional shots
- "team": Group photos of multiple people together
- "gallery": Work samples, portfolio pieces, finished products, food photos, project examples
- "product": Product photography, items for sale, merchandise
- "service": Images showing services being performed, action shots of work
- "logo": Company logos, badges, icons, small graphics
- "unusable": Images with heavy text overlays, poor quality, tiny images, icons, or screenshots with text

CRITICAL TEXT DETECTION RULES (READ CAREFULLY):
1. If you can read ANY words in the image (business name, tagline, hours, prices, signage), mark hasText: TRUE and DO NOT classify as "hero"
2. Storefront photos with signage = hasText: true, NOT "hero"
3. Images with logos overlaid = hasText: true, NOT "hero"
4. Images with promotional text, prices, or menus = hasText: true
5. When in doubt, mark hasText: true (safer to show pattern than ugly text overlap)
6. Only pristine, completely text-free atmospheric shots should be "hero"

CLASSIFICATION RULES:
1. Images with ANY visible embedded text, logos, signage, or UI elements should NEVER be classified as "hero" - mark hasText: true
2. Portrait/headshot photos should be classified as "about", NOT "hero"
3. Screenshots of websites or apps should be "unusable"
4. Only wide, high-quality, completely text-free images should be "hero"
5. If unsure whether an image has text, mark hasText: true to be safe
6. Storefront/facade photos almost always have signage - default to hasText: true

## CONTENT EXTRACTION

Extract and organize ALL available content:

1. Hero section: main headline, subheadline, call-to-action text
2. About section: company description, mission statement, key value propositions (extract 3-5 strong points)
3. Services section: list of ALL services with titles and detailed descriptions
4. Contact section: email, phone, address, social links
5. Gallery/Portfolio: extract ALL image URLs found
6. Instagram feed: if Instagram posts/images are found, extract them
7. Testimonials: any customer quotes or reviews with names
8. Statistics: any numbers/stats mentioned

## ADAPTIVE SECTION TITLES

Use industry-appropriate titles IN THE DETECTED LANGUAGE of the source website.

Examples per language:
- English: "Our Services", "Gallery", "About Us", "What Clients Say", "Contact"
- Dutch: "Onze Diensten", "Galerij", "Over Ons", "Wat Klanten Zeggen", "Contact"
- German: "Unsere Leistungen", "Galerie", "Über Uns", "Kundenstimmen", "Kontakt"

Industry-specific examples (adapt to detected language):
| Business Type | Services Title (EN) | Gallery Title (EN) |
|--------------|---------------------|-------------------|
| Barber/Salon | Treatments | Our Work |
| Restaurant/Cafe | Menu | Our Dishes |
| Law Firm | Practice Areas | Results |
| Creative Agency | What We Do | Portfolio |
| Healthcare | Treatments | Our Practice |
| Construction | Our Services | Recent Projects |
| Tech/SaaS | Solutions | How It Works |
| Retail | Collection | Gallery |
| Default | Our Services | Gallery |

## ADAPTIVE CTA TEXT

Use industry-appropriate CTA text IN THE DETECTED LANGUAGE.

Examples (adapt to detected language):
| Business Type | CTA Text (EN) |
|--------------|---------------|
| Barber/Salon | Book an Appointment |
| Restaurant | Reserve Now |
| Law Firm | Schedule a Consultation |
| Creative Agency | Start Your Project |
| Healthcare | Book an Appointment |
| Construction | Request a Quote |
| Tech/SaaS | Try for Free |
| Retail | View Collection |
| Default | Get in Touch |

Return a JSON object with this exact structure:
{
  "businessIntelligence": {
    "industry": "string - one of the industry categories",
    "businessType": "string - specific business type",
    "targetAudience": "string - primary audience",
    "brandPersonality": "string - brand personality",
    "primaryAction": "string - primary action type",
    "contentPriority": ["array of section names in order of importance"],
    "recommendedTemplate": "string - one of the 5 template IDs",
    "confidence": 0.85
  },
  "brandColors": {
    "primary": "#hexcolor - REQUIRED main brand color",
    "secondary": "#hexcolor or null",
    "accent": "#hexcolor or null",
    "background": "#hexcolor or null",
    "textPrimary": "#hexcolor or null",
    "colorScheme": "light" or "dark"
  },
  "adaptedContent": {
    "servicesTitle": "string - industry-appropriate services title",
    "galleryTitle": "string - industry-appropriate gallery title",
    "aboutTitle": "string - industry-appropriate about title IN DETECTED LANGUAGE",
    "testimonialsTitle": "string - industry-appropriate IN DETECTED LANGUAGE",
    "contactTitle": "string - industry-appropriate IN DETECTED LANGUAGE"
  },
  "classifiedImages": [
    {
      "url": "string - the image URL",
      "classification": "hero|about|team|gallery|product|service|logo|unusable",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation of classification",
      "hasText": true|false,
      "subjectType": "portrait|group|interior|exterior|product|abstract|food|action"
    }
  ],
  "hero": {
    "headline": "string - make it impactful and industry-appropriate",
    "subheadline": "string - compelling value proposition", 
    "ctaText": "string - industry-appropriate action button text",
    "backgroundImages": ["array of ONLY images classified as 'hero' with hasText: false"],
    "fallbackPattern": "tech|beauty|food|legal|creative|medical|construction|retail|fitness|automotive|education|default"
  },
  "about": {
    "title": "string",
    "description": "string - detailed company description",
    "valueProps": ["string", "string", "string"],
    "stats": [
      { "value": "25+", "label": "Years of Experience (use detected language)" }
    ],
    "image": "string url or null - first image classified as 'about' or 'team'"
  },
  "services": [
    { "title": "string", "description": "string", "image": "string url or null" }
  ],
  "gallery": {
    "images": ["array of ALL image URLs found on the site"],
    "title": "string - industry-appropriate section title"
  },
  "instagram": {
    "handle": "string - instagram username if found",
    "posts": [
      { "image": "string url", "caption": "string or null", "link": "string url" }
    ]
  },
  "testimonials": [
    { "quote": "string", "author": "string", "role": "string or null" }
  ],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "instagram": "string url or null",
    "facebook": "string url or null"
  },
  "logo": "string url or null",
  "companyName": "string",
  "tagline": "string - short brand tagline if available",
  "detectedLanguage": "string - ISO 639-1 code (en, nl, de, fr, es, etc.)"
}

CRITICAL EXTRACTION RULES - READ CAREFULLY:
1. TESTIMONIALS: Only include testimonials if you find 2 or more GENUINE, DISTINCT customer reviews with real names and meaningful quotes (at least 20+ characters). If fewer than 2 real reviews exist, return an EMPTY testimonials array []. Do NOT fabricate or generate fake testimonials.

2. INSTAGRAM: Only include Instagram data if the website has a VISIBLE Instagram feed embed with actual posts. If no real Instagram content exists, return empty: { "handle": null, "posts": [] }. Do NOT fabricate Instagram posts.

3. SERVICES: Only include services that are explicitly mentioned on the website. Minimum 2 distinct services required.

4. IMAGES: Extract ALL real images from the website. Filter out icons, logos, and tiny images.

5. NEVER FABRICATE CONTENT: If content doesn't exist on the source website, return empty arrays or null values.

6. BUSINESS INTELLIGENCE IS MANDATORY: You MUST analyze and fill in the businessIntelligence object accurately. This drives the entire website generation.

7. IMAGE CLASSIFICATION IS MANDATORY: You MUST classify every image. Only put images in hero.backgroundImages if they are classified as "hero" with hasText: false. Set the fallbackPattern based on the industry if no suitable hero images exist.

8. FALLBACK PATTERN: Always set hero.fallbackPattern to match the industry (e.g., "tech" for technology, "food" for food_hospitality). This ensures beautiful backgrounds even without suitable hero images.`;

    // Extract logo from branding data
    const logoUrl = brandColors?.logo || brandColors?.images?.logo || scrapedContent?.branding?.logo || scrapedContent?.branding?.images?.logo || null;
    console.log('Logo URL found:', logoUrl);

    // Extract ALL images from HTML - comprehensive extraction for atmosphere photos
    const htmlContent = scrapedContent?.html || '';
    
    // Multiple patterns to catch all image sources
    const patterns = [
      /src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
      /data-src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
      /data-lazy-src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
      /data-original=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
      /data-full-res=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
      /srcset=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^\s"']*)/gi,
      /background(?:-image)?:\s*url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp|gif)[^"')]*)/gi,
      /content=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi,
    ];
    
    const allImageUrls = new Set<string>();
    
    for (const pattern of patterns) {
      const matches = htmlContent.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          let url = match[1].trim();
          // Handle relative URLs
          if (url.startsWith('//')) {
            url = 'https:' + url;
          }
          // Filter out tiny images, icons, and tracking pixels
          if (
            url.length > 10 &&
            !url.includes('favicon') &&
            !url.includes('icon') &&
            !url.includes('logo') &&
            !url.includes('thumb') &&
            !url.includes('1x1') &&
            !url.includes('pixel') &&
            !url.includes('tracking') &&
            !url.includes('analytics') &&
            !url.includes('badge') &&
            !url.includes('button') &&
            !url.includes('sprite') &&
            (url.startsWith('http') || url.startsWith('/'))
          ) {
            allImageUrls.add(url);
          }
        }
      }
    }
    
    // Also extract from markdown image syntax
    const markdownContent = scrapedContent?.markdown || '';
    const mdImageMatches = markdownContent.matchAll(/!\[.*?\]\(([^)]+)\)/gi);
    for (const match of mdImageMatches) {
      if (match[1] && match[1].startsWith('http')) {
        allImageUrls.add(match[1]);
      }
    }
    
    const extractedImages = Array.from(allImageUrls).slice(0, 50);
    console.log('Extracted atmosphere photos count:', extractedImages.length);

    const userPrompt = `Here is the scraped website content to analyze:

MARKDOWN CONTENT:
${scrapedContent?.markdown || 'No markdown content available'}

HTML CONTENT (for image extraction):
${htmlContent.slice(0, 15000)}

BRAND COLORS AND BRANDING:
${JSON.stringify(brandColors || scrapedContent?.branding || {}, null, 2)}

EXTRACTED IMAGES FROM HTML:
${JSON.stringify(extractedImages, null, 2)}

LINKS FOUND:
${JSON.stringify(scrapedContent?.links?.slice(0, 30) || [], null, 2)}

METADATA:
${JSON.stringify(scrapedContent?.metadata || {}, null, 2)}

LOGO URL (if found):
${logoUrl || 'No logo found'}

IMPORTANT: 
1. First, carefully analyze what TYPE of business this is (barber, restaurant, law firm, agency, etc.)
2. Then recommend the BEST template for this business type
3. Set the content priority based on what matters most for this business
4. Use industry-appropriate section titles and CTA text
5. Return the complete structured JSON schema with the businessIntelligence object filled in accurately`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI processing failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let processedSchema;
    try {
      processedSchema = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Ensure businessIntelligence exists with sensible defaults
    if (!processedSchema.businessIntelligence) {
      processedSchema.businessIntelligence = {
        industry: 'other',
        businessType: 'general',
        targetAudience: 'local_consumers',
        brandPersonality: 'professional',
        primaryAction: 'contact_us',
        contentPriority: ['services', 'about', 'gallery', 'testimonials', 'contact'],
        recommendedTemplate: 'corporate-classic',
        confidence: 0.5
      };
    }

    // Ensure adaptedContent exists
    if (!processedSchema.adaptedContent) {
      processedSchema.adaptedContent = {
        servicesTitle: 'Our Services',
        galleryTitle: 'Gallery',
        aboutTitle: 'About Us',
        testimonialsTitle: 'What Clients Say',
        contactTitle: 'Contact'
      };
    }

    // Ensure extracted images are included even if AI missed them
    if (!processedSchema.gallery) {
      processedSchema.gallery = { images: [], title: processedSchema.adaptedContent?.galleryTitle || 'Gallery' };
    }
    if (extractedImages.length > 0 && processedSchema.gallery.images.length === 0) {
      processedSchema.gallery.images = extractedImages;
    }

    console.log('Business Intelligence:', JSON.stringify(processedSchema.businessIntelligence, null, 2));

    return new Response(
      JSON.stringify({ success: true, schema: processedSchema }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
