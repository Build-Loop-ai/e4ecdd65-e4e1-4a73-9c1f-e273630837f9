/**
 * Industry-specific color palettes for fallback when brand colors can't be extracted
 */

export interface IndustryColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  name: string;
}

export const industryColors: Record<string, IndustryColorPalette> = {
  // Technology - Trust, innovation, professionalism
  technology: {
    primary: '#3B82F6', // Blue
    secondary: '#06B6D4', // Cyan
    accent: '#8B5CF6', // Purple
    name: 'Technology',
  },
  
  // AI/Tech Startups - Modern, cutting-edge
  ai_consultancy: {
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    accent: '#06B6D4', // Cyan
    name: 'AI Consultancy',
  },
  
  // Beauty/Wellness - Soft, luxurious, calming
  beauty: {
    primary: '#EC4899', // Pink
    secondary: '#F472B6', // Light pink
    accent: '#D946EF', // Fuchsia
    name: 'Beauty & Wellness',
  },
  
  wellness: {
    primary: '#14B8A6', // Teal
    secondary: '#22C55E', // Green
    accent: '#06B6D4', // Cyan
    name: 'Wellness',
  },
  
  // Food/Hospitality - Warm, appetizing, inviting
  food: {
    primary: '#F97316', // Orange
    secondary: '#EF4444', // Red
    accent: '#FBBF24', // Amber
    name: 'Food & Hospitality',
  },
  
  restaurant: {
    primary: '#DC2626', // Red
    secondary: '#F97316', // Orange
    accent: '#FBBF24', // Amber
    name: 'Restaurant',
  },
  
  cafe: {
    primary: '#92400E', // Brown
    secondary: '#D97706', // Amber
    accent: '#F59E0B', // Yellow
    name: 'Cafe',
  },
  
  // Legal/Professional - Trust, authority, stability
  legal: {
    primary: '#1E3A5F', // Navy
    secondary: '#64748B', // Slate
    accent: '#0EA5E9', // Sky
    name: 'Legal & Professional',
  },
  
  professional_services: {
    primary: '#1E40AF', // Deep blue
    secondary: '#3B82F6', // Blue
    accent: '#6366F1', // Indigo
    name: 'Professional Services',
  },
  
  // Healthcare - Clean, trustworthy, calming
  healthcare: {
    primary: '#14B8A6', // Teal
    secondary: '#22C55E', // Green
    accent: '#06B6D4', // Cyan
    name: 'Healthcare',
  },
  
  medical: {
    primary: '#0D9488', // Teal
    secondary: '#10B981', // Emerald
    accent: '#3B82F6', // Blue
    name: 'Medical',
  },
  
  // Construction/Industrial - Strong, reliable, grounded
  construction: {
    primary: '#D97706', // Amber
    secondary: '#78716C', // Stone
    accent: '#F59E0B', // Yellow
    name: 'Construction',
  },
  
  industrial: {
    primary: '#4B5563', // Gray
    secondary: '#D97706', // Amber
    accent: '#F59E0B', // Yellow
    name: 'Industrial',
  },
  
  // Creative/Agency - Bold, innovative, expressive
  creative: {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    accent: '#F43F5E', // Rose
    name: 'Creative Agency',
  },
  
  agency: {
    primary: '#7C3AED', // Violet
    secondary: '#DB2777', // Pink
    accent: '#F59E0B', // Amber
    name: 'Agency',
  },
  
  // Retail/E-commerce - Exciting, accessible, modern
  retail: {
    primary: '#6366F1', // Indigo
    secondary: '#F43F5E', // Rose
    accent: '#FBBF24', // Amber
    name: 'Retail',
  },
  
  ecommerce: {
    primary: '#059669', // Emerald
    secondary: '#0891B2', // Cyan
    accent: '#F59E0B', // Amber
    name: 'E-commerce',
  },
  
  // Real Estate - Premium, trustworthy
  real_estate: {
    primary: '#1F2937', // Gray 800
    secondary: '#D4AF37', // Gold
    accent: '#0EA5E9', // Sky
    name: 'Real Estate',
  },
  
  // Education - Friendly, trustworthy, growth
  education: {
    primary: '#2563EB', // Blue
    secondary: '#16A34A', // Green
    accent: '#F59E0B', // Amber
    name: 'Education',
  },
  
  // Finance - Trust, stability, security
  finance: {
    primary: '#1E3A5F', // Navy
    secondary: '#059669', // Emerald
    accent: '#0EA5E9', // Sky
    name: 'Finance',
  },
  
  // Fitness - Energy, motivation, action
  fitness: {
    primary: '#DC2626', // Red
    secondary: '#F97316', // Orange
    accent: '#FBBF24', // Amber
    name: 'Fitness',
  },
  
  // Non-profit - Warm, caring, hopeful
  nonprofit: {
    primary: '#0891B2', // Cyan
    secondary: '#10B981', // Emerald
    accent: '#F59E0B', // Amber
    name: 'Non-profit',
  },
};

// Default fallback for unknown industries
export const defaultColors: IndustryColorPalette = {
  primary: '#6366F1', // Indigo - universally professional
  secondary: '#64748B', // Slate
  accent: '#0EA5E9', // Sky
  name: 'Default',
};

/**
 * Get color palette for a given industry
 */
export function getIndustryColors(industry?: string | null): IndustryColorPalette {
  if (!industry) return defaultColors;
  
  // Normalize the industry string
  const normalized = industry.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Direct match
  if (industryColors[normalized]) {
    return industryColors[normalized];
  }
  
  // Partial match - check if industry contains any known key
  for (const key of Object.keys(industryColors)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return industryColors[key];
    }
  }
  
  // Category-based matching
  if (normalized.includes('tech') || normalized.includes('software') || normalized.includes('saas')) {
    return industryColors.technology;
  }
  if (normalized.includes('ai') || normalized.includes('machine') || normalized.includes('data')) {
    return industryColors.ai_consultancy;
  }
  if (normalized.includes('beauty') || normalized.includes('salon') || normalized.includes('spa')) {
    return industryColors.beauty;
  }
  if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('cafe')) {
    return industryColors.food;
  }
  if (normalized.includes('law') || normalized.includes('legal') || normalized.includes('attorney')) {
    return industryColors.legal;
  }
  if (normalized.includes('health') || normalized.includes('medical') || normalized.includes('clinic')) {
    return industryColors.healthcare;
  }
  if (normalized.includes('build') || normalized.includes('construct') || normalized.includes('contractor')) {
    return industryColors.construction;
  }
  if (normalized.includes('design') || normalized.includes('creative') || normalized.includes('agency')) {
    return industryColors.creative;
  }
  if (normalized.includes('shop') || normalized.includes('store') || normalized.includes('retail')) {
    return industryColors.retail;
  }
  
  return defaultColors;
}

/**
 * Get pattern type recommendation based on industry
 */
export function getPatternTypeForIndustry(industry?: string | null): string {
  if (!industry) return 'mesh';
  
  const normalized = industry.toLowerCase();
  
  if (normalized.includes('tech') || normalized.includes('ai') || normalized.includes('software')) {
    return 'tech-circuit';
  }
  if (normalized.includes('beauty') || normalized.includes('wellness') || normalized.includes('spa')) {
    return 'beauty-waves';
  }
  if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('cafe')) {
    return 'food-organic';
  }
  if (normalized.includes('legal') || normalized.includes('law') || normalized.includes('finance')) {
    return 'legal-grid';
  }
  if (normalized.includes('creative') || normalized.includes('agency') || normalized.includes('design')) {
    return 'creative-blocks';
  }
  if (normalized.includes('construction') || normalized.includes('fitness') || normalized.includes('industrial')) {
    return 'angular';
  }
  if (normalized.includes('retail') || normalized.includes('shop') || normalized.includes('store')) {
    return 'dots';
  }
  
  return 'mesh';
}
