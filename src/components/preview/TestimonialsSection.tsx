'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role?: string | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  primaryColor?: string;
}

export function TestimonialsSection({
  testimonials,
  primaryColor,
}: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-20%"]);

  if (!testimonials || testimonials.length === 0) return null;

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
        {testimonials.map((testimonial, index) => (
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
