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

export interface ProcessedSchema {
  businessIntelligence?: BusinessIntelligence;
  adaptedContent?: AdaptedContent;
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImages?: string[];
  };
  about: {
    title: string;
    description: string;
    valueProps: string[];
    stats?: Array<{ value: string; label: string }>;
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
