'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface Testimonial {
  quote: string;
  author: string;
  role?: string | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  primaryColor?: string;
  templateId?: TemplateId;
}

export function TestimonialsSection({
  testimonials,
  primaryColor,
  templateId,
}: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-20%"]);
  const template = getTemplateStyle(templateId);

  // Filter testimonials with meaningful content (at least 20 characters)
  const validTestimonials = testimonials?.filter(t => 
    t.quote && t.quote.length >= 20 && t.author && t.author.length >= 2
  ) || [];

  // Require minimum 2 valid testimonials to show section
  if (validTestimonials.length < 2) return null;

  // Elegant Minimal variant
  if (templateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-40 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 
              className="text-3xl md:text-4xl font-light tracking-tight mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Wat klanten zeggen
            </h2>
            <div 
              className="w-16 h-px mx-auto"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Centered single testimonial display */}
          <div className="space-y-20">
            {validTestimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <p 
                  className="text-xl md:text-2xl leading-relaxed text-foreground mb-8"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div 
                    className="w-px h-6"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                    {testimonial.role && (
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Warm Friendly variant
  if (templateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="py-24 overflow-hidden bg-gradient-to-b from-orange-50/30 to-background">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Wat klanten zeggen
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>
        </div>

        {/* Rounded cards */}
        <motion.div 
          style={{ x }}
          className="flex gap-6 pl-6"
        >
          {validTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[340px] md:w-[420px] p-8 rounded-3xl bg-white shadow-lg shadow-orange-100/30 border border-orange-100/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>
              <p className="text-foreground leading-relaxed">
                "{testimonial.quote}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  // Bold Starter variant
  if (templateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="py-32 overflow-hidden bg-black">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ 
                background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Wat klanten zeggen
            </h2>
          </motion.div>
        </div>

        {/* Glassmorphism cards */}
        <motion.div 
          style={{ x }}
          className="flex gap-6 pl-6"
        >
          {validTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex-shrink-0 w-[380px] md:w-[480px] p-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <Quote 
                className="w-16 h-16 mb-6"
                style={{ 
                  color: primaryColor || '#3b82f6',
                  opacity: 0.5
                }}
              />
              <p className="text-xl md:text-2xl leading-relaxed mb-8 text-white">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}, #8b5cf6)` 
                  }}
                >
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  {testimonial.role && (
                    <p className="text-sm text-white/50">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  // Default: Modern Professional / Corporate Classic
  return (
    <section ref={containerRef} className="py-24 overflow-hidden bg-muted/30">
      <div className="container mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Wat klanten zeggen
          </h2>
          <div 
            className="w-16 h-1"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </motion.div>
      </div>

      {/* Horizontal scrolling testimonials */}
      <motion.div 
        style={{ x }}
        className="flex gap-8 pl-6"
      >
        {validTestimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex-shrink-0 w-[400px] md:w-[500px] p-10 rounded-3xl bg-background border border-border/50 shadow-sm"
          >
            <Quote 
              className="w-12 h-12 mb-6 opacity-20"
              style={{ color: primaryColor || 'hsl(var(--primary))' }}
            />
            <p className="text-lg md:text-xl leading-relaxed mb-8 text-foreground">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
              >
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                {testimonial.role && (
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
