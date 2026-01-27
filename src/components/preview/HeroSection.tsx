'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  companyName?: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  logo?: string | null;
  backgroundImages?: string[];
  isModern?: boolean;
  primaryColor?: string;
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
}: HeroSectionProps) {
  const bgImage = backgroundImages?.[0];

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
        {/* Logo */}
        {logo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 flex justify-center"
          >
            <img 
              src={logo} 
              alt={companyName || 'Logo'} 
              className="h-16 md:h-20 w-auto object-contain filter brightness-0 invert"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
            className="group text-lg px-10 py-7 rounded-full font-semibold bg-white text-black hover:bg-white/90 shadow-2xl transition-all duration-500 hover:scale-105"
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
