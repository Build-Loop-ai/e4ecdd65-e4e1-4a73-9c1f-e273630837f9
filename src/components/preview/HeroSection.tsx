'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { FloatingShape } from '@/components/animations/FloatingShape';
import { WaveDivider } from '@/components/animations/WaveDivider';
import { TiltCard } from '@/components/animations/TiltCard';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImage = backgroundImages?.[0];
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const getContrastColor = (hexColor: string | undefined) => {
    if (!hexColor) return 'black';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  // ========== ELEGANT MINIMAL - "Atelier" ==========
  // Maximum whitespace, centered serif text, thin animated line - WITH BACKGROUND IMAGE
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image - always present */}
        <div className="absolute inset-0">
          {bgImage ? (
            <motion.img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ scale }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50" />
          )}
          {/* Light elegant overlay */}
          <div className="absolute inset-0 bg-stone-50/85" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <motion.div style={{ opacity }} className="container mx-auto max-w-4xl text-center relative z-10 px-6 py-32">
          {/* Logo - extremely refined */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="mb-24 flex justify-center"
            >
              <SmartLogo 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-1000"
                onDark={false}
                fallbackText={companyName}
              />
            </motion.div>
          )}

          {/* Serif headline with ultra-slow reveal */}
          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-stone-900 leading-[1.1] tracking-[-0.03em] mb-12"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {headline}
          </motion.h1>

          {/* Animated thin line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-24 h-px mx-auto mb-12 origin-center"
            style={{ backgroundColor: primaryColor || '#1a1a1a' }}
          />

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto leading-relaxed tracking-wide"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {subheadline}
          </motion.p>

          {/* Scroll indicator only - no CTA button for luxury feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3 text-stone-400"
            >
              <span className="text-[10px] tracking-[0.4em] uppercase">Ontdek</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // ========== WARM FRIENDLY - "Neighborhood" ==========
  // Clean, inviting design with subtle warmth - lets the image breathe
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image with clean dark gradient overlay */}
        <div className="absolute inset-0">
          {bgImage ? (
            <motion.img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ scale }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900" />
          )}
          {/* Clean gradient overlay - dark at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        
        {/* Subtle accent glow in corner */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: primaryColor || '#f97316' }}
        />

        <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl relative z-10 px-6 py-32">
          <div className="max-w-3xl">
            {/* Logo - clean floating card */}
            {logo && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 inline-block"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                  <SmartLogo 
                    src={logo} 
                    alt={companyName || 'Logo'} 
                    className="h-12 w-auto object-contain"
                    onDark={false}
                    fallbackText={companyName}
                  />
                </div>
              </motion.div>
            )}

            {/* Clean headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              {headline}
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10"
            >
              {subheadline}
            </motion.p>

            {/* CTA with brand color */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="group text-base px-8 py-6 rounded-full font-semibold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor || '#f97316', 
                  color: getContrastColor(primaryColor),
                }}
              >
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtle wave divider */}
        <WaveDivider color="hsl(var(--background))" variant="wave" animated />
      </section>
    );
  }

  // ========== BOLD STARTER - "Impact Studio" ==========
  // Clean massive white headline on black, WITH BACKGROUND IMAGE
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Background image - always present */}
        <div className="absolute inset-0">
          {bgImage ? (
            <motion.img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ scale }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
          )}
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Subtle gradient orb - not overwhelming */}
        <motion.div 
          animate={{ 
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />

        <motion.div style={{ y, opacity }} className="container mx-auto max-w-6xl text-center relative z-10 px-6">
          {/* Logo */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16 flex justify-center"
            >
              <SmartLogo 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-12 w-auto object-contain"
                onDark={true}
                fallbackText={companyName}
              />
            </motion.div>
          )}

          {/* CLEAN massive white headline - NO gradient, NO duplicate */}
          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* CTA with glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              size="lg"
              className="group text-lg px-12 py-8 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: getContrastColor(primaryColor || '#3b82f6'),
                boxShadow: `0 0 60px -15px ${primaryColor || '#3b82f6'}`,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
          >
            <motion.div 
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/50 rounded-full" 
            />
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL - "Tech Forward" ==========
  // Clean centered layout WITH BACKGROUND IMAGE always present
  if (effectiveTemplateId === 'modern-professional') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Background image - always present */}
        <div className="absolute inset-0">
          {bgImage ? (
            <motion.img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ scale }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
          )}
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Gradient mesh background with animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px] opacity-25"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] opacity-20"
            style={{ backgroundColor: '#06b6d4' }}
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px]"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <motion.div
          style={{ y, opacity }}
          className="container mx-auto max-w-5xl text-center relative z-10 px-6"
        >
          {/* Logo */}
          {logo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12 flex justify-center"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <SmartLogo 
                  src={logo} 
                  alt={companyName || 'Logo'} 
                  className="h-10 w-auto object-contain"
                  onDark={true}
                  fallbackText={companyName}
                />
              </div>
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              size="lg"
              className="group text-base px-10 py-7 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: getContrastColor(primaryColor || '#3b82f6'),
                boxShadow: `0 0 80px -20px ${primaryColor || '#3b82f6'}`,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-10 py-7 rounded-xl font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              Meer info
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
          >
            <motion.div 
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/50 rounded-full" 
            />
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC - Split-screen image+text, Ken Burns ==========
  // Clean, professional light design with authority
  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Subtle professional pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-24">
          {/* Left - Text content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            {/* Only show logo if it's a real image, not fallback */}
            {logo && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-10"
              >
                <SmartLogo 
                  src={logo} 
                  alt={companyName || 'Logo'} 
                  className="h-12 w-auto object-contain"
                  onDark={false}
                />
              </motion.div>
            )}

            {/* Company name badge if no logo */}
            {!logo && companyName && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <span 
                  className="inline-block text-sm font-semibold tracking-widest uppercase px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: `${primaryColor || '#3b82f6'}15`,
                    color: primaryColor || '#3b82f6',
                  }}
                >
                  {companyName}
                </span>
              </motion.div>
            )}

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
            >
              {headline}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed mb-10"
            >
              {subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: primaryColor || '#1e40af',
                  color: getContrastColor(primaryColor || '#1e40af'),
                }}
              >
                {ctaText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-lg font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Meer info
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Image with Ken Burns */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
              {bgImage ? (
                <motion.img
                  src={bgImage}
                  alt=""
                  className="w-full h-full object-cover"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}30 0%, ${primaryColor || '#3b82f6'}10 50%, ${primaryColor || '#3b82f6'}25 100%)`
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>
            
            {/* Decorative element */}
            <div 
              className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl -z-10 opacity-20"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
