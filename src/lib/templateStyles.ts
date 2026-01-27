// Template Style Configuration
// Each template has a unique visual identity for different business types

export type TemplateId = 
  | 'modern-professional'
  | 'corporate-classic'
  | 'bold-starter'
  | 'elegant-minimal'
  | 'warm-friendly';

export type IndustryType = 
  | 'beauty_wellness'
  | 'food_hospitality'
  | 'professional_services'
  | 'creative_agency'
  | 'retail_ecommerce'
  | 'healthcare'
  | 'construction_trades'
  | 'technology'
  | 'education'
  | 'fitness_sports'
  | 'automotive'
  | 'other';

export interface IndustryColorHints {
  preferDark: boolean;
  warmTones: boolean;
  highContrast: boolean;
  accentUsage: 'bold' | 'subtle' | 'accent-only';
}

export interface TemplateStyle {
  id: TemplateId;
  name: string;
  shortName: string;
  description: string;
  targetAudience: string;
  hero: {
    dark: boolean;
    gradientOrbs?: boolean;
    imageOverlay?: boolean;
    fullGradient?: boolean;
    gradientText?: boolean;
    serif?: boolean;
    warmOverlay?: boolean;
  };
  borderRadius: string;
  fontWeight: string;
  cardStyle: string;
  animationIntensity: 'subtle' | 'moderate' | 'bold';
  industryFit: IndustryType[];
  colorHints: IndustryColorHints;
}

export const TEMPLATE_STYLES: Record<TemplateId, TemplateStyle> = {
  'modern-professional': {
    id: 'modern-professional',
    name: 'Modern Professional',
    shortName: 'Modern',
    description: 'Contemporary design with gradient accents',
    targetAudience: 'Tech companies, agencies',
    hero: { dark: true, gradientOrbs: true },
    borderRadius: 'rounded-xl',
    fontWeight: 'font-bold',
    cardStyle: 'bg-background/5 backdrop-blur-sm border border-border/50',
    animationIntensity: 'moderate',
    industryFit: ['technology', 'creative_agency', 'education'],
    colorHints: {
      preferDark: true,
      warmTones: false,
      highContrast: true,
      accentUsage: 'bold',
    },
  },
  'corporate-classic': {
    id: 'corporate-classic',
    name: 'Corporate Classic',
    shortName: 'Classic',
    description: 'Traditional, professional corporate styling',
    targetAudience: 'Business, corporate',
    hero: { dark: true, imageOverlay: true },
    borderRadius: 'rounded-lg',
    fontWeight: 'font-semibold',
    cardStyle: 'bg-card border border-border shadow-sm',
    animationIntensity: 'subtle',
    industryFit: ['professional_services', 'healthcare', 'construction_trades', 'automotive'],
    colorHints: {
      preferDark: false,
      warmTones: false,
      highContrast: true,
      accentUsage: 'subtle',
    },
  },
  'bold-starter': {
    id: 'bold-starter',
    name: 'Bold Starter',
    shortName: 'Bold',
    description: 'Vibrant gradients for startups and creatives',
    targetAudience: 'Startups, creative agencies',
    hero: { dark: true, fullGradient: true, gradientText: true },
    borderRadius: 'rounded-2xl',
    fontWeight: 'font-black',
    cardStyle: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    animationIntensity: 'bold',
    industryFit: ['creative_agency', 'technology'],
    colorHints: {
      preferDark: true,
      warmTones: false,
      highContrast: true,
      accentUsage: 'bold',
    },
  },
  'elegant-minimal': {
    id: 'elegant-minimal',
    name: 'Elegant Minimal',
    shortName: 'Elegant',
    description: 'Refined luxury with maximum whitespace',
    targetAudience: 'Luxury, design brands',
    hero: { dark: false, serif: true },
    borderRadius: 'rounded-sm',
    fontWeight: 'font-light',
    cardStyle: 'bg-background border border-border/30',
    animationIntensity: 'subtle',
    industryFit: ['retail_ecommerce'],
    colorHints: {
      preferDark: false,
      warmTones: false,
      highContrast: false,
      accentUsage: 'accent-only',
    },
  },
  'warm-friendly': {
    id: 'warm-friendly',
    name: 'Warm Friendly',
    shortName: 'Warm',
    description: 'Approachable design for local businesses',
    targetAudience: 'Local businesses, cafes',
    hero: { dark: false, warmOverlay: true },
    borderRadius: 'rounded-3xl',
    fontWeight: 'font-medium',
    cardStyle: 'bg-background shadow-lg shadow-primary/5 border border-border/50',
    animationIntensity: 'moderate',
    industryFit: ['beauty_wellness', 'food_hospitality', 'fitness_sports', 'retail_ecommerce'],
    colorHints: {
      preferDark: false,
      warmTones: true,
      highContrast: false,
      accentUsage: 'bold',
    },
  },
};

// Industry to template mapping for auto-recommendation
export const INDUSTRY_TEMPLATE_MAP: Record<IndustryType, TemplateId> = {
  beauty_wellness: 'warm-friendly',
  food_hospitality: 'warm-friendly',
  professional_services: 'corporate-classic',
  creative_agency: 'bold-starter',
  retail_ecommerce: 'elegant-minimal',
  healthcare: 'corporate-classic',
  construction_trades: 'corporate-classic',
  technology: 'modern-professional',
  education: 'modern-professional',
  fitness_sports: 'warm-friendly',
  automotive: 'corporate-classic',
  other: 'corporate-classic',
};

// Default section order per industry
export const INDUSTRY_SECTION_ORDER: Record<IndustryType, string[]> = {
  beauty_wellness: ['services', 'gallery', 'testimonials', 'about', 'contact'],
  food_hospitality: ['gallery', 'services', 'about', 'testimonials', 'contact'],
  professional_services: ['about', 'services', 'testimonials', 'gallery', 'contact'],
  creative_agency: ['gallery', 'services', 'about', 'testimonials', 'contact'],
  retail_ecommerce: ['gallery', 'services', 'testimonials', 'about', 'contact'],
  healthcare: ['services', 'about', 'testimonials', 'gallery', 'contact'],
  construction_trades: ['services', 'gallery', 'testimonials', 'about', 'contact'],
  technology: ['services', 'about', 'testimonials', 'gallery', 'contact'],
  education: ['services', 'about', 'testimonials', 'gallery', 'contact'],
  fitness_sports: ['services', 'gallery', 'testimonials', 'about', 'contact'],
  automotive: ['services', 'gallery', 'testimonials', 'about', 'contact'],
  other: ['services', 'about', 'gallery', 'testimonials', 'contact'],
};

// Friendly display names for industries
export const INDUSTRY_DISPLAY_NAMES: Record<IndustryType, string> = {
  beauty_wellness: 'Beauty & Wellness',
  food_hospitality: 'Food & Hospitality',
  professional_services: 'Professional Services',
  creative_agency: 'Creative Agency',
  retail_ecommerce: 'Retail & E-commerce',
  healthcare: 'Healthcare',
  construction_trades: 'Construction & Trades',
  technology: 'Technology',
  education: 'Education',
  fitness_sports: 'Fitness & Sports',
  automotive: 'Automotive',
  other: 'Business',
};

export const getTemplateStyle = (templateId: string | undefined): TemplateStyle => {
  const id = (templateId || 'corporate-classic') as TemplateId;
  return TEMPLATE_STYLES[id] || TEMPLATE_STYLES['corporate-classic'];
};

export const getAllTemplates = (): TemplateStyle[] => {
  return Object.values(TEMPLATE_STYLES);
};

export const getRecommendedTemplate = (industry: IndustryType): TemplateId => {
  return INDUSTRY_TEMPLATE_MAP[industry] || 'corporate-classic';
};

export const getDefaultSectionOrder = (industry: IndustryType): string[] => {
  return INDUSTRY_SECTION_ORDER[industry] || INDUSTRY_SECTION_ORDER.other;
};
