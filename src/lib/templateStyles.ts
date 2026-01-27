// Template Style Configuration
// Each template has a unique visual identity for different business types

export type TemplateId = 
  | 'modern-professional'
  | 'corporate-classic'
  | 'bold-starter'
  | 'elegant-minimal'
  | 'warm-friendly';

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
  },
};

export const getTemplateStyle = (templateId: string | undefined): TemplateStyle => {
  const id = (templateId || 'corporate-classic') as TemplateId;
  return TEMPLATE_STYLES[id] || TEMPLATE_STYLES['corporate-classic'];
};

export const getAllTemplates = (): TemplateStyle[] => {
  return Object.values(TEMPLATE_STYLES);
};
