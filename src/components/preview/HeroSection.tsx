'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { TextReveal } from '@/components/animations/TextReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { FloatingShape } from '@/components/animations/FloatingShape';
import { WaveDivider } from '@/components/animations/WaveDivider';
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

  const ctaTextColor = primaryColor ? getContrastColor(primaryColor) : 'black';

  // ========== ELEGANT MINIMAL - "Atelier" ==========
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-50">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <motion.div style={{ opacity }} className="container mx-auto max-w-5xl text-center relative z-10 px-6 py-32">
          {/* Logo - extremely refined */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="mb-20 flex justify-center"
            >
              <SmartLogo 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-700"
                onDark={false}
                fallbackText={companyName}
              />
            </motion.div>
          )}

          {/* Serif headline with slow reveal */}
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-stone-900 leading-[1.1] tracking-[-0.02em] mb-10"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {headline}
          </motion.h1>

          {/* Animated thin line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-32 h-px mx-auto mb-10 origin-center"
            style={{ backgroundColor: primaryColor || '#1a1a1a' }}
          />

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed tracking-wide"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {subheadline}
          </motion.p>

          {/* Scroll indicator only - no CTA button for luxury feel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-stone-400"
            >
              <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // ========== WARM FRIENDLY - "Neighborhood" ==========
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Warm gradient background with organic shapes */}
        <div className="absolute inset-0" style={{
          background: bgImage 
            ? `linear-gradient(to bottom, rgba(255,247,237,0.92), rgba(254,243,199,0.95)), url(${bgImage}) center/cover`
            : `linear-gradient(135deg, #fff7ed 0%, #fef3c7 30%, #fce7f3 70%, #f3e8ff 100%)`
        }} />
        
        {/* Floating organic blobs */}
        <FloatingShape color={primaryColor || '#f97316'} size={500} blur={120} className="top-0 right-0 opacity-30" duration={25} />
        <FloatingShape color="#ec4899" size={400} blur={100} className="bottom-0 left-0 opacity-25" duration={30} delay={5} />
        <FloatingShape color="#a855f7" size={300} blur={80} className="top-1/2 left-1/4 opacity-20" duration={20} delay={10} shape="blob" />

        <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl text-center relative z-10 px-6">
          {/* Logo with playful container */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="mb-10 flex justify-center"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-2xl shadow-orange-200/40 border border-orange-100/50">
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

          {/* Bouncy headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-stone-800 leading-[1.1] tracking-tight mb-6"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
            className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* Bouncy CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, type: 'spring', bounce: 0.5 }}
          >
            <MagneticButton 
              strength={0.2}
              className="group inline-flex items-center gap-3 text-lg px-10 py-6 rounded-full font-bold shadow-2xl shadow-orange-300/40 transition-all duration-300 hover:shadow-3xl"
              onClick={() => {}}
            >
              <span 
                className="flex items-center gap-3"
                style={{ backgroundColor: primaryColor || '#f97316', color: 'white', padding: '16px 32px', borderRadius: '9999px' }}
              >
                {ctaText}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </span>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Wave divider at bottom */}
        <WaveDivider color="hsl(var(--background))" variant="wave" animated />
      </section>
    );
  }

  // ========== BOLD STARTER - "Impact Studio" ==========
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 150, 0],
              y: [0, -100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] rounded-full blur-[200px] opacity-40"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          />
          <motion.div 
            animate={{ 
              x: [0, -120, 0],
              y: [0, 150, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full blur-[180px] opacity-50"
            style={{ backgroundColor: '#8b5cf6' }}
          />
          <motion.div 
            animate={{ 
              x: [0, 80, 0],
              y: [0, -80, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30"
            style={{ backgroundColor: '#ec4899' }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        {/* Floating glassmorphism cards */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute top-20 left-[10%] w-40 h-40 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10"
        />
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-32 right-[15%] w-28 h-28 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 rotate-12"
        />

        <motion.div style={{ y, opacity, scale }} className="container mx-auto max-w-6xl text-center relative z-10 px-6">
          {/* Logo with glow */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-14 flex justify-center"
            >
              <div 
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20"
                style={{ boxShadow: `0 0 60px -10px ${primaryColor || '#3b82f6'}60` }}
              >
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

          {/* Character-by-character gradient headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-10"
          >
            <TextReveal 
              type="char" 
              staggerDelay={0.03}
              className="inline-block"
              as="span"
            >
              {headline}
            </TextReveal>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="block text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 40%, #8b5cf6 100%)`,
                WebkitBackgroundClip: 'text',
              }}
            >
              {headline}
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed mb-14"
          >
            {subheadline}
          </motion.p>

          {/* Neon glow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative text-lg px-14 py-7 rounded-2xl font-bold text-white overflow-hidden"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                boxShadow: `0 0 60px -10px ${primaryColor || '#3b82f6'}, 0 20px 60px -20px ${primaryColor || '#3b82f6'}`,
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {ctaText}
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, ${primaryColor || '#3b82f6'}50 50%, transparent 100%)`,
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-7 h-12 border-2 border-white/20 rounded-full flex justify-center pt-3"
          >
            <motion.div 
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white/60 rounded-full" 
            />
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL - "Tech Forward" ==========
  if (effectiveTemplateId === 'modern-professional') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-30"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
            }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
            style={{ backgroundColor: '#06b6d4' }}
          />
        </div>

        {/* Background image with overlay */}
        {bgImage && (
          <motion.div style={{ scale }} className="absolute inset-0">
            <img src={bgImage} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]" />
          </motion.div>
        )}

        <motion.div style={{ y, opacity }} className="container mx-auto max-w-6xl text-center relative z-10 px-6">
          {/* Logo */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
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

          {/* Staggered word reveal headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8">
            <TextReveal type="word" staggerDelay={0.08} delay={0.3}>
              {headline}
            </TextReveal>
          </h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          {/* Magnetic CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <MagneticButton
              strength={0.25}
              className="group inline-flex items-center gap-3 text-lg px-10 py-7 rounded-full font-semibold shadow-2xl transition-all duration-500"
            >
              <span
                className="flex items-center gap-3 px-10 py-5 rounded-full"
                style={{
                  backgroundColor: primaryColor || 'white',
                  color: ctaTextColor,
                }}
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </MagneticButton>
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

  // ========== CORPORATE CLASSIC - "Executive Suite" ==========
  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Split screen layout */}
      <div className="absolute inset-0 grid lg:grid-cols-2">
        {/* Left - Dark content area */}
        <div className="bg-[#0f0f0f] relative">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: primaryColor 
                ? `radial-gradient(ellipse at 20% 80%, ${primaryColor}40 0%, transparent 50%)`
                : 'radial-gradient(ellipse at 20% 80%, hsl(var(--primary) / 0.4) 0%, transparent 50%)'
            }}
          />
        </div>
        
        {/* Right - Image area */}
        <motion.div style={{ scale }} className="hidden lg:block relative">
          {bgImage ? (
            <>
              <img src={bgImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/30 to-transparent" />
            </>
          ) : (
            <div 
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor || 'hsl(var(--primary))'}30 0%, transparent 100%)`
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Mobile bg image */}
      {bgImage && (
        <div className="absolute inset-0 lg:hidden">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/90 to-[#0f0f0f]" />
        </div>
      )}

      <motion.div style={{ y, opacity }} className="container mx-auto max-w-7xl relative z-10 px-6 lg:px-12">
        <div className="max-w-2xl">
          {/* Logo */}
          {logo && (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <SmartLogo 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-14 md:h-16 w-auto object-contain"
                onDark={true}
                fallbackText={companyName}
              />
            </motion.div>
          )}

          {/* Staggered text reveal headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8">
            <TextReveal type="line" delay={0.3}>
              {headline}
            </TextReveal>
          </h1>

          {/* Accent line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-24 h-1 mb-8 origin-left"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-lg"
          >
            {subheadline}
          </motion.p>

          {/* CTA with underline animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Button 
              size="lg" 
              className="group text-base px-10 py-7 rounded-none font-semibold relative overflow-hidden"
              style={{
                backgroundColor: primaryColor || 'white',
                color: ctaTextColor,
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                {ctaText}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-white/40 text-xs tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
