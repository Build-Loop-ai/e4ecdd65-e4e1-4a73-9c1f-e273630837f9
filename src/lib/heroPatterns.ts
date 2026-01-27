'use client';

import type { TemplateId } from './templateStyles';

// Pattern types for industry-specific backgrounds
export type PatternType = 
  | 'tech-circuit' 
  | 'beauty-waves' 
  | 'food-organic' 
  | 'legal-grid' 
  | 'creative-blocks' 
  | 'medical-clean' 
  | 'construction-angular' 
  | 'retail-modern'
  | 'fitness-dynamic'
  | 'automotive-speed'
  | 'education-flow'
  | 'default-gradient';

// Map industry to pattern type
export function getPatternForIndustry(industry: string): PatternType {
  const industryPatternMap: Record<string, PatternType> = {
    'technology': 'tech-circuit',
    'beauty_wellness': 'beauty-waves',
    'food_hospitality': 'food-organic',
    'professional_services': 'legal-grid',
    'creative_agency': 'creative-blocks',
    'healthcare': 'medical-clean',
    'construction_trades': 'construction-angular',
    'retail_ecommerce': 'retail-modern',
    'fitness_sports': 'fitness-dynamic',
    'automotive': 'automotive-speed',
    'education': 'education-flow',
  };
  
  return industryPatternMap[industry] || 'default-gradient';
}

// Get pattern configuration for SVG rendering
export interface PatternConfig {
  id: PatternType;
  name: string;
  gradientStops: { offset: string; opacity: number }[];
  elements: 'circles' | 'lines' | 'waves' | 'grid' | 'blocks' | 'angular' | 'dots' | 'mesh';
  animationDuration: number;
  overlayOpacity: number;
}

export function getPatternConfig(patternType: PatternType): PatternConfig {
  const configs: Record<PatternType, PatternConfig> = {
    'tech-circuit': {
      id: 'tech-circuit',
      name: 'Tech Circuit',
      gradientStops: [
        { offset: '0%', opacity: 0.4 },
        { offset: '50%', opacity: 0.2 },
        { offset: '100%', opacity: 0.3 },
      ],
      elements: 'lines',
      animationDuration: 20,
      overlayOpacity: 0.7,
    },
    'beauty-waves': {
      id: 'beauty-waves',
      name: 'Beauty Waves',
      gradientStops: [
        { offset: '0%', opacity: 0.3 },
        { offset: '50%', opacity: 0.15 },
        { offset: '100%', opacity: 0.25 },
      ],
      elements: 'waves',
      animationDuration: 25,
      overlayOpacity: 0.6,
    },
    'food-organic': {
      id: 'food-organic',
      name: 'Food Organic',
      gradientStops: [
        { offset: '0%', opacity: 0.35 },
        { offset: '50%', opacity: 0.2 },
        { offset: '100%', opacity: 0.3 },
      ],
      elements: 'circles',
      animationDuration: 18,
      overlayOpacity: 0.65,
    },
    'legal-grid': {
      id: 'legal-grid',
      name: 'Legal Grid',
      gradientStops: [
        { offset: '0%', opacity: 0.25 },
        { offset: '50%', opacity: 0.1 },
        { offset: '100%', opacity: 0.2 },
      ],
      elements: 'grid',
      animationDuration: 30,
      overlayOpacity: 0.75,
    },
    'creative-blocks': {
      id: 'creative-blocks',
      name: 'Creative Blocks',
      gradientStops: [
        { offset: '0%', opacity: 0.45 },
        { offset: '50%', opacity: 0.25 },
        { offset: '100%', opacity: 0.35 },
      ],
      elements: 'blocks',
      animationDuration: 15,
      overlayOpacity: 0.55,
    },
    'medical-clean': {
      id: 'medical-clean',
      name: 'Medical Clean',
      gradientStops: [
        { offset: '0%', opacity: 0.2 },
        { offset: '50%', opacity: 0.1 },
        { offset: '100%', opacity: 0.15 },
      ],
      elements: 'waves',
      animationDuration: 28,
      overlayOpacity: 0.8,
    },
    'construction-angular': {
      id: 'construction-angular',
      name: 'Construction Angular',
      gradientStops: [
        { offset: '0%', opacity: 0.35 },
        { offset: '50%', opacity: 0.2 },
        { offset: '100%', opacity: 0.3 },
      ],
      elements: 'angular',
      animationDuration: 22,
      overlayOpacity: 0.65,
    },
    'retail-modern': {
      id: 'retail-modern',
      name: 'Retail Modern',
      gradientStops: [
        { offset: '0%', opacity: 0.3 },
        { offset: '50%', opacity: 0.15 },
        { offset: '100%', opacity: 0.25 },
      ],
      elements: 'dots',
      animationDuration: 20,
      overlayOpacity: 0.7,
    },
    'fitness-dynamic': {
      id: 'fitness-dynamic',
      name: 'Fitness Dynamic',
      gradientStops: [
        { offset: '0%', opacity: 0.4 },
        { offset: '50%', opacity: 0.2 },
        { offset: '100%', opacity: 0.35 },
      ],
      elements: 'angular',
      animationDuration: 12,
      overlayOpacity: 0.6,
    },
    'automotive-speed': {
      id: 'automotive-speed',
      name: 'Automotive Speed',
      gradientStops: [
        { offset: '0%', opacity: 0.35 },
        { offset: '50%', opacity: 0.2 },
        { offset: '100%', opacity: 0.3 },
      ],
      elements: 'lines',
      animationDuration: 10,
      overlayOpacity: 0.65,
    },
    'education-flow': {
      id: 'education-flow',
      name: 'Education Flow',
      gradientStops: [
        { offset: '0%', opacity: 0.25 },
        { offset: '50%', opacity: 0.12 },
        { offset: '100%', opacity: 0.2 },
      ],
      elements: 'mesh',
      animationDuration: 25,
      overlayOpacity: 0.75,
    },
    'default-gradient': {
      id: 'default-gradient',
      name: 'Default Gradient',
      gradientStops: [
        { offset: '0%', opacity: 0.3 },
        { offset: '50%', opacity: 0.15 },
        { offset: '100%', opacity: 0.25 },
      ],
      elements: 'mesh',
      animationDuration: 20,
      overlayOpacity: 0.7,
    },
  };
  
  return configs[patternType] || configs['default-gradient'];
}

// Get pattern colors based on template
export function getPatternColors(templateId: TemplateId, primaryColor?: string) {
  const defaultPrimary = primaryColor || '#3b82f6';
  
  const templateColors: Record<TemplateId, { bg: string; accent: string }> = {
    'corporate-classic': { bg: '#1e293b', accent: defaultPrimary },
    'modern-professional': { bg: '#0a0a0a', accent: defaultPrimary },
    'bold-starter': { bg: '#0a0a0a', accent: defaultPrimary },
    'elegant-minimal': { bg: '#1c1917', accent: defaultPrimary },
    'warm-friendly': { bg: '#292524', accent: defaultPrimary },
  };
  
  return templateColors[templateId] || templateColors['corporate-classic'];
}
