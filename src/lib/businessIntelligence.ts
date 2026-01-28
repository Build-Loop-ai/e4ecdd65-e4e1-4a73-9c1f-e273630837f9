// Business Intelligence Types and Utilities

export interface BusinessIntelligence {
  industry: string;
  businessType: string;
  targetAudience: string;
  brandPersonality: string;
  primaryAction: string;
  contentPriority: string[];
  recommendedTemplate: string;
  confidence: number;
}

export interface AdaptedContent {
  servicesTitle: string;
  galleryTitle: string;
  aboutTitle: string;
  testimonialsTitle: string;
  contactTitle: string;
}

// Image classification types for intelligent placement
export type ImageClassification = 
  | 'hero' 
  | 'about' 
  | 'team' 
  | 'gallery' 
  | 'product' 
  | 'service' 
  | 'logo' 
  | 'unusable';

export type ImageSubjectType = 
  | 'portrait' 
  | 'group' 
  | 'interior' 
  | 'exterior' 
  | 'product' 
  | 'abstract' 
  | 'food' 
  | 'action';

export interface ClassifiedImage {
  url: string;
  classification: ImageClassification;
  confidence: number;
  reasoning?: string;
  hasText: boolean;
  subjectType?: ImageSubjectType;
}

export type FallbackPatternType = 
  | 'tech' 
  | 'beauty' 
  | 'food' 
  | 'legal' 
  | 'creative' 
  | 'medical' 
  | 'construction' 
  | 'retail'
  | 'fitness'
  | 'automotive'
  | 'education'
  | 'default';

// Brand colors from AI analysis
export interface BrandColors {
  primary: string;
  secondary?: string | null;
  accent?: string | null;
  background?: string | null;
  textPrimary?: string | null;
  colorScheme?: 'light' | 'dark';
}

export interface ProcessedSchema {
  businessIntelligence?: BusinessIntelligence;
  adaptedContent?: AdaptedContent;
  brandColors?: BrandColors;
  classifiedImages?: ClassifiedImage[];
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImages?: string[];
    fallbackPattern?: FallbackPatternType;
  };
  about: {
    title: string;
    description: string;
    valueProps: string[];
    stats?: Array<{ value: string; label: string }>;
    image?: string | null;
  };
  services: Array<{
    title: string;
    description: string;
    image?: string | null;
  }>;
  gallery?: {
    images: string[];
    title?: string;
  };
  instagram?: {
    handle?: string;
    posts: Array<{
      image: string;
      caption?: string | null;
      link: string;
    }>;
  };
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string | null;
  }>;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    instagram?: string | null;
    facebook?: string | null;
  };
  logo: string | null;
  companyName: string;
  tagline?: string;
}

// Default adapted content if not provided by AI
export const DEFAULT_ADAPTED_CONTENT: AdaptedContent = {
  servicesTitle: 'Onze Diensten',
  galleryTitle: 'Galerij',
  aboutTitle: 'Over Ons',
  testimonialsTitle: 'Wat Klanten Zeggen',
  contactTitle: 'Contact',
};

// Default business intelligence if not provided by AI
export const DEFAULT_BUSINESS_INTELLIGENCE: BusinessIntelligence = {
  industry: 'other',
  businessType: 'general',
  targetAudience: 'local_consumers',
  brandPersonality: 'professional',
  primaryAction: 'contact_us',
  contentPriority: ['services', 'about', 'gallery', 'testimonials', 'contact'],
  recommendedTemplate: 'corporate-classic',
  confidence: 0.5,
};

// Get section order from schema or use defaults
export function getSectionOrder(schema: ProcessedSchema | null): string[] {
  if (schema?.businessIntelligence?.contentPriority?.length) {
    return schema.businessIntelligence.contentPriority;
  }
  return DEFAULT_BUSINESS_INTELLIGENCE.contentPriority;
}

// Get adapted content from schema or use defaults
export function getAdaptedContent(schema: ProcessedSchema | null): AdaptedContent {
  if (schema?.adaptedContent) {
    return {
      ...DEFAULT_ADAPTED_CONTENT,
      ...schema.adaptedContent,
    };
  }
  return DEFAULT_ADAPTED_CONTENT;
}

// Get business intelligence from schema or use defaults
export function getBusinessIntelligence(schema: ProcessedSchema | null): BusinessIntelligence {
  if (schema?.businessIntelligence) {
    return {
      ...DEFAULT_BUSINESS_INTELLIGENCE,
      ...schema.businessIntelligence,
    };
  }
  return DEFAULT_BUSINESS_INTELLIGENCE;
}

// Get suitable hero images (images classified as hero that don't have text)
// STRICT MODE: Only return images that are EXPLICITLY classified as hero without text
export function getSuitableHeroImages(schema: ProcessedSchema | null): string[] {
  if (!schema?.classifiedImages || !schema.hero?.backgroundImages) {
    // No classification data = no suitable images (forces pattern fallback)
    return [];
  }
  
  // STRICT: Only include images that are explicitly classified as 'hero' AND have hasText: false
  return schema.hero.backgroundImages.filter(imgUrl => {
    const classification = schema.classifiedImages?.find(c => c.url === imgUrl);
    // Must be explicitly classified as hero with no text
    if (!classification) return false;
    return classification.classification === 'hero' && classification.hasText === false;
  });
}

// Get about section image (portrait/team photo for split layouts)
export function getAboutImage(schema: ProcessedSchema | null): string | null {
  // First check if about section already has an image
  if (schema?.about?.image) {
    return schema.about.image;
  }
  
  // Otherwise, find the first "about" or "team" classified image
  if (schema?.classifiedImages) {
    const aboutImage = schema.classifiedImages.find(
      img => (img.classification === 'about' || img.classification === 'team') && 
             !img.hasText && 
             img.confidence > 0.6
    );
    return aboutImage?.url || null;
  }
  
  return null;
}

// Map industry to fallback pattern type
export function getFallbackPatternType(industry: string): FallbackPatternType {
  const industryPatternMap: Record<string, FallbackPatternType> = {
    'technology': 'tech',
    'beauty_wellness': 'beauty',
    'food_hospitality': 'food',
    'professional_services': 'legal',
    'creative_agency': 'creative',
    'healthcare': 'medical',
    'construction_trades': 'construction',
    'retail_ecommerce': 'retail',
    'fitness_sports': 'fitness',
    'automotive': 'automotive',
    'education': 'education',
  };
  
  return industryPatternMap[industry] || 'default';
}

// Check if we should use pattern fallback (no suitable hero images)
export function shouldUsePatternFallback(schema: ProcessedSchema | null): boolean {
  const suitableImages = getSuitableHeroImages(schema);
  return suitableImages.length === 0;
}
