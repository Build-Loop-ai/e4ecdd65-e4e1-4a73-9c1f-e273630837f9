'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { WaveDivider } from '@/components/animations/WaveDivider';

import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { 
  type ClassifiedImage,
  type FallbackPatternType,
} from '@/lib/businessIntelligence';

import { getButtonTextColor, isDarkColor, getReadableTextColor } from '@/lib/colorContrast';
import { toast } from 'sonner';

// Fun preview messages to show when buttons are clicked
const previewMessages = [
  "✨ This is just a preview! Once we work together, this button will do amazing things.",
  "🚀 Love the enthusiasm! This will be fully functional after we team up.",
  "💡 Great click! This feature comes to life when we build your real site.",
  "🎨 You found a button! All interactions will work on your actual website.",
  "⚡ Nice! This is where the magic happens once we collaborate.",
];

const getRandomMessage = () => previewMessages[Math.floor(Math.random() * previewMessages.length)];

export const handlePreviewClick = (e: React.MouseEvent) => {
  e.preventDefault();
  toast(getRandomMessage(), {
    duration: 4000,
    position: 'bottom-center',
  });
};

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
  // New props for intelligent image handling
  classifiedImages?: ClassifiedImage[];
  fallbackPattern?: FallbackPatternType;
  industry?: string;
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
  classifiedImages,
  fallbackPattern,
  industry,
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  // Determine suitable hero image using STRICT classification
  // Only use images that are explicitly classified as 'hero' with hasText: false
  const getSuitableImage = (): string | null => {
    if (!backgroundImages?.length) return null;
    
    // Check each background image
    for (const imgUrl of backgroundImages) {
      // Trust AI-regenerated images from our storage bucket
      if (imgUrl.includes('/generated-images/')) {
        console.log('Using regenerated hero image:', imgUrl);
        return imgUrl;
      }
      
      // For scraped images, require strict classification
      if (classifiedImages?.length) {
        const classification = classifiedImages.find(c => c.url === imgUrl);
        if (classification?.classification === 'hero' && classification.hasText === false) {
          console.log('Found suitable hero image:', imgUrl);
          return imgUrl;
        }
      }
    }
    
    // No suitable image found - use pattern fallback
    console.log('No suitable hero images found, using pattern fallback');
    return null;
  };

  const bgImage = getSuitableImage();



  // Use the imported color contrast utilities
  const buttonTextColor = getButtonTextColor(primaryColor || '#3B82F6');
  
  // Determine if we're on a dark background template
  const isDarkTemplate = effectiveTemplateId === 'bold-starter' || effectiveTemplateId === 'modern-professional';
  const heroTextColor = isDarkTemplate ? '#FFFFFF' : getReadableTextColor('#FFFFFF', primaryColor);

  // ========== ELEGANT MINIMAL - "Atelier" ==========
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background - image or pattern */}
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

          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-stone-900 leading-[1.1] tracking-[-0.03em] mb-12"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {headline}
          </motion.h1>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-24 h-px mx-auto mb-12 origin-center"
            style={{ backgroundColor: primaryColor || '#1a1a1a' }}
          />

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto leading-relaxed tracking-wide"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {subheadline}
          </motion.p>

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
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background - image or pattern */}
        <div className="absolute inset-0">
          {bgImage ? (
            <>
              <motion.img
                src={bgImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ scale }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="w-full h-full" style={{
              background: `linear-gradient(135deg, #292524 0%, ${primaryColor || '#f97316'}15 50%, #1c1917 100%)`,
            }} />
          )}
        </div>
        
        {/* Subtle accent glow */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: primaryColor || '#f97316' }}
        />

        <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl relative z-10 px-6 py-32">
          <div className="max-w-3xl">
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

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              {headline}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10"
            >
              {subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={handlePreviewClick}
                className="group text-base px-8 py-6 rounded-full font-semibold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor || '#f97316', 
                  color: buttonTextColor,
                }}
              >
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <WaveDivider color="hsl(var(--background))" variant="wave" animated />
      </section>
    );
  }

  // ========== BOLD STARTER - "Impact Studio" ==========
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Background - image or pattern */}
        <div className="absolute inset-0">
          {bgImage ? (
            <>
              <motion.img
                src={bgImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ scale }}
              />
              <div className="absolute inset-0 bg-black/70" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
          )}
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Subtle gradient orb */}
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

          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-8"
          >
            {headline}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              size="lg"
              onClick={handlePreviewClick}
              className="group text-lg px-12 py-8 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: buttonTextColor,
                boxShadow: `0 0 60px -15px ${primaryColor || '#3b82f6'}`,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>

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
  if (effectiveTemplateId === 'modern-professional') {
    return (
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#050510' }}>
        {/* Background image or animated gradient mesh */}
        <div className="absolute inset-0">
          {bgImage ? (
            <>
              <motion.img
                src={bgImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ scale }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/80 via-[#050510]/60 to-[#050510]/90" />
            </>
          ) : (
            <>
              {/* Rich animated gradient mesh — no pattern */}
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 20% 30%, ${primaryColor || '#3b82f6'}25 0%, transparent 70%),
                  radial-gradient(ellipse 60% 80% at 80% 70%, #06b6d420 0%, transparent 70%),
                  radial-gradient(ellipse 50% 50% at 50% 50%, ${primaryColor || '#3b82f6'}10 0%, transparent 80%),
                  linear-gradient(180deg, #050510 0%, #0a0a2e 50%, #050510 100%)
                `,
              }} />
            </>
          )}
        </div>

        {/* Animated floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full blur-[180px] opacity-30"
            style={{ backgroundColor: primaryColor || '#3b82f6', top: '10%', left: '15%' }}
          />
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute w-[400px] h-[400px] rounded-full blur-[160px] opacity-20"
            style={{ backgroundColor: '#06b6d4', bottom: '10%', right: '10%' }}
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute w-[600px] h-[600px] rounded-full blur-[200px]"
            style={{ backgroundColor: primaryColor || '#3b82f6', top: '40%', left: '40%' }}
          />
        </div>

        {/* Floating glassmorphic UI elements for depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating card top-right */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="absolute top-[15%] right-[8%] hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-28 rounded-2xl border border-white/[0.08] backdrop-blur-sm"
              style={{ background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}15, transparent)` }}
            >
              <div className="p-4">
                <div className="w-8 h-1.5 rounded-full mb-3" style={{ backgroundColor: `${primaryColor || '#3b82f6'}60` }} />
                <div className="w-full h-1 rounded-full bg-white/[0.06] mb-2" />
                <div className="w-3/4 h-1 rounded-full bg-white/[0.04]" />
              </div>
            </motion.div>
          </motion.div>

          {/* Floating card bottom-left */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="absolute bottom-[20%] left-[6%] hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -1, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="w-40 h-24 rounded-2xl border border-white/[0.08] backdrop-blur-sm"
              style={{ background: `linear-gradient(225deg, #06b6d415, transparent)` }}
            >
              <div className="p-4">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${primaryColor || '#3b82f6'}50` }} />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.06] mb-2" />
                <div className="w-2/3 h-1 rounded-full bg-white/[0.04]" />
              </div>
            </motion.div>
          </motion.div>

          {/* Accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-0 right-0 h-px origin-left"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${primaryColor || '#3b82f6'}30 50%, transparent 100%)` }}
          />
        </div>

        {/* Content */}
        <motion.div
          style={{ y, opacity }}
          className="container mx-auto max-w-5xl text-center relative z-10 px-6"
        >
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

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex justify-center"
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase px-5 py-2 rounded-full border border-white/10 backdrop-blur-sm"
              style={{ color: `${primaryColor || '#3b82f6'}`, backgroundColor: `${primaryColor || '#3b82f6'}15` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor || '#3b82f6' }} />
              {companyName || 'Welcome'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-14"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={handlePreviewClick}
              className="group text-base px-10 py-7 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: buttonTextColor,
                boxShadow: `0 0 60px -10px ${primaryColor || '#3b82f6'}80, 0 0 120px -30px ${primaryColor || '#3b82f6'}40`,
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePreviewClick}
              className="text-base px-10 py-7 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
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

  // ========== CORPORATE CLASSIC - Full-width hero, value prop front & center ==========
  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background - image with overlay or clean gradient */}
      <div className="absolute inset-0">
        {bgImage ? (
          <>
            <motion.img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/75 to-slate-900/50" />
          </>
        ) : (
          <>
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor || '#1e40af'} 0%, ${primaryColor || '#1e40af'}dd 40%, ${primaryColor || '#1e40af'}99 100%)`,
              }}
            />
            {/* Subtle grid texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }} />
            {/* Soft accent glow */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{ background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)` }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      <motion.div style={{ y, opacity }} className="container mx-auto max-w-5xl relative z-10 px-6 py-32">
        <div className="max-w-3xl">
          {logo && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
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

          {!logo && companyName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-block text-sm font-semibold tracking-widest uppercase text-white/70">
                {companyName}
              </span>
            </motion.div>
          )}

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            {headline}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-10"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              onClick={handlePreviewClick}
              className="group text-base px-8 py-6 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: '#ffffff',
                color: '#1e293b',
              }}
            >
              {ctaText}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handlePreviewClick}
              className="text-base px-8 py-6 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.25)',
              }}
            >
              Meer info
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
