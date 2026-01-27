'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface HeroSectionProps {
  companyName?: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  logo?: string | null;
  backgroundImages?: string[];
  isModern?: boolean;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function HeroSection({
  companyName,
  headline,
  subheadline,
  ctaText,
  logo,
  backgroundImages = [],
  isModern = false,
  primaryColor,
  templateId,
}: HeroSectionProps) {
  const bgImage = backgroundImages?.[0];
  const template = getTemplateStyle(templateId);
  
  // Determine template from isModern if templateId not provided (backward compatibility)
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  // Calculate contrast color for CTA button
  const getContrastColor = (hexColor: string | undefined) => {
    if (!hexColor) return 'black';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  const ctaTextColor = primaryColor ? getContrastColor(primaryColor) : 'black';

  // Template-specific rendering
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10 px-6 py-32">
          {/* Logo */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mb-16 flex justify-center"
            >
              <SmartLogo 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-12 w-auto object-contain"
                onDark={false}
                fallbackText={companyName}
              />
            </motion.div>
          )}

          {/* Serif headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[1.1] tracking-tight mb-8"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {headline}
          </motion.h1>

          {/* Thin accent line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-24 h-px mx-auto mb-8"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* Minimal CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button 
              variant="outline"
              size="lg" 
              className="group text-base px-8 py-6 rounded-none border-foreground hover:bg-foreground hover:text-background transition-all duration-500"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Warm gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: bgImage 
              ? `linear-gradient(to bottom, rgba(255,247,237,0.85), rgba(255,237,213,0.9)), url(${bgImage}) center/cover`
              : `linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fce7f3 100%)`
          }}
        />
        
        {/* Floating warm orbs */}
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-40"
          style={{ backgroundColor: primaryColor || '#f97316' }}
        />
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{ backgroundColor: '#ec4899' }}
        />

        <div className="container mx-auto max-w-5xl text-center relative z-10 px-6">
          {/* Logo with rounded container */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 flex justify-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-orange-200/50">
                <SmartLogo 
                  src={logo} 
                  alt={companyName || 'Logo'} 
                  className="h-14 w-auto object-contain"
                  onDark={false}
                  fallbackText={companyName}
                />
              </div>
            </motion.div>
          )}

          {/* Friendly headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.15] tracking-tight mb-6"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {subheadline}
          </motion.p>

          {/* Rounded CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="lg" 
              className="group text-lg px-10 py-7 rounded-full font-semibold shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundColor: primaryColor || 'hsl(var(--primary))',
                color: ctaTextColor,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-background">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>
    );
  }

  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #0f0f0f 0%, ${primaryColor || '#3b82f6'}22 50%, #0f0f0f 100%)`
          }}
        />
        
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-50">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[150px]"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ backgroundColor: '#8b5cf6' }}
          />
        </div>

        {/* Glassmorphism floating elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-32 right-20 w-24 h-24 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
        />

        <div className="container mx-auto max-w-6xl text-center relative z-10 px-6">
          {/* Logo */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12 flex justify-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <SmartLogo 
                  src={logo} 
                  alt={companyName || 'Logo'} 
                  className="h-16 w-auto object-contain"
                  onDark={true}
                  fallbackText={companyName}
                />
              </div>
            </motion.div>
          )}

          {/* Gradient text headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8"
            style={{
              background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 50%, #8b5cf6 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* Glowing CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="lg" 
              className="group text-lg px-12 py-8 rounded-2xl font-bold shadow-2xl transition-all duration-500 hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: 'white',
                boxShadow: `0 20px 60px -15px ${primaryColor || '#3b82f6'}80`,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // Default: modern-professional or corporate-classic
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      {bgImage && (
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img 
            src={bgImage} 
            alt="" 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </motion.div>
      )}

      {/* Fallback gradient background */}
      {!bgImage && (
        <div className="absolute inset-0 bg-foreground">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: primaryColor 
                ? `radial-gradient(ellipse at 20% 80%, ${primaryColor}50 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${primaryColor}30 0%, transparent 50%)`
                : 'radial-gradient(ellipse at 20% 80%, hsl(var(--primary) / 0.5) 0%, transparent 50%)'
            }}
          />
          {/* Animated gradient orbs */}
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 80, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto max-w-6xl text-center relative z-10 px-6">
        {/* Logo - using SmartLogo for proper rendering */}
        {logo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 flex justify-center"
          >
            <SmartLogo 
              src={logo} 
              alt={companyName || 'Logo'} 
              className="h-16 md:h-20 w-auto object-contain"
              onDark={true}
              fallbackText={companyName}
            />
          </motion.div>
        )}

        {/* Company name if no logo */}
        {companyName && !logo && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm font-medium uppercase tracking-[0.4em] mb-8 text-white/60"
          >
            {companyName}
          </motion.p>
        )}

        {/* Main headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8"
        >
          {headline.split(' ').map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12"
        >
          {subheadline}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Button 
            size="lg" 
            className="group text-lg px-10 py-7 rounded-full font-semibold shadow-2xl transition-all duration-500 hover:scale-105"
            style={{
              backgroundColor: primaryColor || 'white',
              color: ctaTextColor,
            }}
          >
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
