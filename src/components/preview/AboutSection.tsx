'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

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
}

export function AboutSection({
  title,
  description,
  valueProps = [],
  stats = [],
  isModern = false,
  primaryColor,
}: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
