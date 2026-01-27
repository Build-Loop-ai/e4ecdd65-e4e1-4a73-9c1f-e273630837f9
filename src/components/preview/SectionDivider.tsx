'use client';

import { motion } from 'framer-motion';
import { type TemplateId } from '@/lib/templateStyles';
import { WaveDivider } from '@/components/animations/WaveDivider';

interface SectionDividerProps {
  templateId?: TemplateId;
  primaryColor?: string;
  className?: string;
}

/**
 * Template-specific section dividers for clean visual separation
 * - Modern/Bold: Thin glowing horizontal line
 * - Corporate: Subtle 1px border
 * - Warm: Wave shape
 * - Elegant: Large whitespace (no visible divider)
 */
export function SectionDivider({ 
  templateId, 
  primaryColor,
  className = '',
}: SectionDividerProps) {
  // Modern Professional / Bold Starter: Glowing horizontal line
  if (templateId === 'modern-professional' || templateId === 'bold-starter') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`h-px w-full ${className}`}
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${primaryColor || '#3b82f6'}40 50%, transparent 100%)`,
          boxShadow: `0 0 30px ${primaryColor || '#3b82f6'}20`,
        }} 
      />
    );
  }
  
  // Corporate Classic: Subtle border line
  if (templateId === 'corporate-classic') {
    return (
      <div 
        className={`h-px w-full bg-border/50 ${className}`}
      />
    );
  }
  
  // Warm Friendly: Wave divider handled separately in sections
  // Elegant Minimal: No visible divider (whitespace only)
  
  return null;
}
