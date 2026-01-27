'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import { TextReveal } from '@/components/animations/TextReveal';
import { TiltCard } from '@/components/animations/TiltCard';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface Stat {
  value: string;
  label: string;
}

interface AboutSectionProps {
  title: string;
  description: string;
  valueProps?: string[];
  stats?: Stat[];
  isModern?: boolean;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function AboutSection({
  title,
  description,
  valueProps = [],
  stats = [],
  isModern = false,
  primaryColor,
  templateId,
}: AboutSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // ========== ELEGANT MINIMAL ==========
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={ref} className="py-48 px-6 bg-stone-50">
        <div className="container mx-auto max-w-4xl">
          {/* Centered refined content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <h2 
              className="text-3xl md:text-5xl lg:text-6xl font-light mb-12 tracking-tight leading-[1.15] text-stone-900"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {title}
            </h2>
            
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-24 h-px mx-auto mb-12"
              style={{ backgroundColor: primaryColor || '#1a1a1a' }}
            />
            
            <p 
              className="text-lg md:text-xl text-stone-500 leading-[1.8] max-w-2xl mx-auto mb-20"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {description}
            </p>
          </motion.div>

          {/* Stats - minimal elegant display */}
          {stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex justify-center gap-20 mb-20 flex-wrap"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <AnimatedCounter 
                    value={stat.value}
                    className="text-5xl md:text-6xl font-light text-stone-900 block mb-3"
                  />
                  <div className="text-sm text-stone-400 tracking-[0.2em] uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Value props - subtle horizontal line items */}
          {valueProps.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="border-t border-stone-200 pt-12"
            >
              <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
                {valueProps.map((prop, index) => (
                  <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="text-stone-500 text-sm tracking-wide flex items-center gap-3"
                  >
                    <span 
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: primaryColor || '#1a1a1a' }}
                    />
                    {prop}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // ========== WARM FRIENDLY ==========
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={ref} className="py-28 px-6 bg-gradient-to-b from-background via-orange-50/20 to-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-stone-800">
                {title}
              </h2>
              <motion.div 
                initial={{ width: 0 }}
                animate={isInView ? { width: 80 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-1.5 rounded-full mb-8"
                style={{ backgroundColor: primaryColor || '#f97316' }}
              />
              <p className="text-lg text-stone-600 leading-relaxed mb-10">
                {description}
              </p>

              {/* Stats in playful cards */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 30, rotate: -3 }}
                      animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: 'spring', bounce: 0.4 }}
                      className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-100/40 border border-orange-100/50"
                    >
                      <AnimatedCounter 
                        value={stat.value}
                        className="text-4xl font-bold block mb-1"
                        duration={1.5}
                      />
                      <div className="text-sm text-stone-500">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - Value Props in friendly stacked cards */}
            {valueProps.length > 0 && (
              <div className="space-y-4">
                {valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50, rotate: 2 }}
                    animate={isInView ? { opacity: 1, x: 0, rotate: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.15, type: 'spring', bounce: 0.3 }}
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className="bg-white rounded-3xl p-6 shadow-lg shadow-orange-100/30 border border-orange-100/50 flex items-center gap-5 cursor-default"
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: primaryColor || '#f97316' }}
                      />
                    </div>
                    <p className="text-stone-700 font-medium">{prop}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ========== BOLD STARTER ==========
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={ref} className="py-40 px-6 bg-black relative overflow-hidden">
        {/* Gradient accent bar */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(90deg, ${primaryColor || '#3b82f6'}, #8b5cf6, #ec4899)` }}
        />
        
        {/* Background glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Large stats display */}
          {stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap justify-center gap-20 mb-24"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="text-center"
                >
                  <AnimatedCounter 
                    value={stat.value}
                    className="text-7xl md:text-8xl lg:text-9xl font-black block mb-4"
                    duration={2}
                  />
                  <div 
                    className="text-sm text-white/40 uppercase tracking-[0.3em]"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}, #8b5cf6)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-10 leading-[1.05]">
                <span 
                  className="block"
                  style={{ 
                    background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {title}
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-white/50 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Right column - Glassmorphism value cards */}
            {valueProps.length > 0 && (
              <div className="space-y-5">
                {valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 60 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  >
                    <TiltCard 
                      tiltAmount={5}
                      glareColor={`${primaryColor || '#3b82f6'}40`}
                      className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 cursor-default"
                    >
                      <p className="text-white font-medium text-lg">{prop}</p>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL ==========
  if (effectiveTemplateId === 'modern-professional') {
    return (
      <section ref={ref} className="py-36 px-6 bg-[#0a0a0a] relative overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Stats row with animated counters */}
          {stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex gap-16 mb-24 overflow-x-auto pb-4"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-shrink-0 text-center min-w-[180px]"
                >
                  <AnimatedCounter 
                    value={stat.value}
                    className="text-5xl md:text-6xl font-black block mb-3"
                    duration={2}
                  />
                  <div className="text-sm text-white/40 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-10 tracking-tight leading-[1.1] text-white">
                <TextReveal type="word" staggerDelay={0.05}>
                  {title}
                </TextReveal>
              </h2>
              <motion.div 
                initial={{ width: 0 }}
                animate={isInView ? { width: 100 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="h-1.5 mb-10"
                style={{ backgroundColor: primaryColor || '#3b82f6' }}
              />
              <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Right column - Value props with hover effects */}
            {valueProps.length > 0 && (
              <div className="space-y-6">
                {valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
                    whileHover={{ x: 10 }}
                    className="group relative pl-8 py-6 border-l-2 border-white/10 hover:border-white/30 transition-all duration-500 cursor-default"
                  >
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0a0a0a] border-2 group-hover:scale-150 transition-transform duration-300"
                      style={{ borderColor: primaryColor || '#3b82f6' }}
                    />
                    <p className="text-lg font-medium text-white">
                      {prop}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC ==========
  return (
    <section ref={ref} className="py-36 px-6 bg-white relative overflow-hidden">
      {/* Subtle decorative line */}
      <motion.div 
        initial={{ height: 0 }}
        animate={isInView ? { height: '100%' } : {}}
        transition={{ duration: 1.5 }}
        className="absolute left-12 top-0 w-px bg-gradient-to-b from-transparent via-stone-200 to-transparent hidden lg:block"
      />
      
      <div className="container mx-auto max-w-6xl">
        {/* Stats with counting animation */}
        {stats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 border-b-2 border-stone-100 hover:border-stone-300 transition-colors"
              >
                <AnimatedCounter 
                  value={stat.value}
                  className="text-4xl md:text-5xl font-bold block mb-2"
                  duration={2}
                />
                <div className="text-sm text-stone-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-[1.1] text-stone-900">
              {title}
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={isInView ? { width: 80 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 mb-8"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Right column - Value props with underline animation */}
          {valueProps.length > 0 && (
            <div className="space-y-8">
              {valueProps.map((prop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
                  className="group relative"
                >
                  <div className="flex items-start gap-4">
                    <span 
                      className="text-sm font-medium mt-1 opacity-30"
                      style={{ color: primaryColor || 'hsl(var(--primary))' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-stone-800 mb-3">
                        {prop}
                      </p>
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        className="h-px bg-stone-200 origin-left group-hover:bg-stone-400 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
