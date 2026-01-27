'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  // Elegant Minimal variant
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={ref} className="py-40 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Centered content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 tracking-tight leading-[1.2]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>
            <div 
              className="w-16 h-px mx-auto mb-10"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-16">
              {description}
            </p>
          </motion.div>

          {/* Stats - minimal horizontal layout */}
          {stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center gap-16 mb-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-light mb-2"
                    style={{ color: primaryColor || 'hsl(var(--primary))' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground tracking-widest uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Value props - subtle list */}
          {valueProps.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-x-12 gap-y-4"
            >
              {valueProps.map((prop, index) => (
                <p key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  />
                  {prop}
                </p>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Warm Friendly variant
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-background to-orange-50/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                {title}
              </h2>
              <div 
                className="w-20 h-1.5 rounded-full mb-6"
                style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
              />
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {description}
              </p>

              {/* Stats in warm cards */}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-lg shadow-orange-100/50 border border-orange-100"
                    >
                      <div 
                        className="text-3xl font-bold mb-1"
                        style={{ color: primaryColor || 'hsl(var(--primary))' }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - Value Props in friendly cards */}
            {valueProps.length > 0 && (
              <div className="space-y-4">
                {valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-md shadow-orange-100/30 border border-orange-100/50 flex items-center gap-4"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}15` }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                      />
                    </div>
                    <p className="text-foreground font-medium">{prop}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Bold Starter variant
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={ref} className="py-32 px-6 bg-black relative overflow-hidden">
        {/* Gradient accent */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(90deg, ${primaryColor || '#3b82f6'}, #8b5cf6)` }}
        />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Stats row - bold display */}
          {stats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap justify-center gap-16 mb-20"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div 
                    className="text-6xl md:text-7xl font-black mb-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}, #8b5cf6)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-[1.1]"
                style={{ 
                  background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title}
              </h2>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Right column - Glassmorphism cards */}
            {valueProps.length > 0 && (
              <div className="space-y-4">
                {valueProps.map((prop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors duration-300"
                  >
                    <p className="text-white font-medium">{prop}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: Modern Professional / Corporate Classic
  return (
    <section ref={ref} className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div 
        className="absolute left-0 top-0 w-px h-full opacity-20"
        style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
      />
      
      <div className="container mx-auto max-w-6xl">
        {/* Stats row - horizontal scroll on mobile */}
        {stats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex gap-12 mb-20 overflow-x-auto pb-4 scrollbar-hide"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-shrink-0 text-center min-w-[150px]"
              >
                <div 
                  className="text-5xl md:text-6xl font-black mb-2"
                  style={{ color: primaryColor || 'hsl(var(--primary))' }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left column - Title and description */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight leading-[1.1]">
              {title}
            </h2>
            <div 
              className="w-24 h-1.5 mb-8"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Right column - Value props */}
          {valueProps.length > 0 && (
            <div className="space-y-6">
              {valueProps.map((prop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
                  className="group relative pl-8 py-6 border-l-2 border-border hover:border-primary transition-colors duration-500"
                  style={{ 
                    '--hover-color': primaryColor || 'hsl(var(--primary))'
                  } as React.CSSProperties}
                >
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-background border-2 group-hover:scale-150 transition-transform duration-300"
                    style={{ borderColor: primaryColor || 'hsl(var(--primary))' }}
                  />
                  <p className="text-lg font-medium text-foreground">
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
