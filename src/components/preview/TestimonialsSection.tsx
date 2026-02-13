'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { MarqueeText } from '@/components/animations/MarqueeText';

interface Testimonial {
  quote: string;
  author: string;
  role?: string | null;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function TestimonialsSection({
  testimonials,
  title = 'What Clients Say',
  primaryColor,
  templateId,
}: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const template = getTemplateStyle(templateId);

  // Filter testimonials with meaningful content
  const validTestimonials = testimonials?.filter(t => 
    t.quote && t.quote.length >= 20 && t.author && t.author.length >= 2
  ) || [];

  // Auto-rotation for carousel-based templates
  const isCarousel = templateId === 'corporate-classic' || templateId === 'elegant-minimal' || templateId === 'modern-professional';
  useEffect(() => {
    if (!isCarousel || validTestimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isCarousel, validTestimonials.length]);

  // Require minimum 2 valid testimonials to show section
  if (validTestimonials.length < 2) return null;

  // Helper to get symmetrical count for grid layouts
  const getSymmetricalCount = (count: number, maxCols: number = 3) => {
    if (maxCols === 3) {
      if (count <= 2) return 2;
      if (count === 3) return 3;
      if (count === 4) return 4; // 2x2
      if (count === 5) return 4; // Drop 1
      if (count >= 6) return 6; // 2x3 or 3x2
      return 6;
    }
    // For 2-column
    if (count <= 2) return 2;
    if (count === 3) return 2;
    if (count >= 4) return 4;
    return 4;
  };

  // ========== ELEGANT MINIMAL - Fade between quotes on scroll ==========
  if (templateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-40 bg-background">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="text-center mb-20"
          >
            <h2 
              className="text-3xl md:text-4xl font-light tracking-tight mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-16 h-px mx-auto origin-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Single quote with fade transition */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <p 
                  className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-foreground mb-10"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  "{validTestimonials[activeIndex].quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div 
                    className="w-px h-8"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {validTestimonials[activeIndex].author}
                    </p>
                    {validTestimonials[activeIndex].role && (
                      <p className="text-xs text-muted-foreground">
                        {validTestimonials[activeIndex].role}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center gap-3 mt-12">
            {validTestimonials.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-8' : 'opacity-30'
                }`}
                style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== WARM FRIENDLY - Speech bubbles with avatars ==========
  if (templateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="py-24 bg-orange-50/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {title} 💬
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || '#f97316' }}
            />
          </motion.div>

          {/* Speech bubble cards - symmetrical */}
          {(() => {
            const symmetricalCount = getSymmetricalCount(validTestimonials.length, 3);
            const displayTestimonials = validTestimonials.slice(0, symmetricalCount);
            const gridCols = symmetricalCount <= 2 ? 'md:grid-cols-2' : 
                             symmetricalCount === 3 ? 'md:grid-cols-3' :
                             symmetricalCount === 4 ? 'md:grid-cols-2' :
                             'md:grid-cols-2 lg:grid-cols-3';
            return (
              <div className={`grid ${gridCols} gap-8`}>
                {displayTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, type: 'spring' }}
                className="relative"
              >
                {/* Speech bubble */}
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-orange-100/40 border border-orange-100/60 relative">
                  <p className="text-foreground leading-relaxed mb-4">
                    "{testimonial.quote}"
                  </p>
                  {/* Bubble tail */}
                  <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-l border-b border-orange-100/60 rotate-[-45deg]" />
                </div>
                
                {/* Author with avatar */}
                <div className="flex items-center gap-3 mt-6 ml-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
                    style={{ backgroundColor: primaryColor || '#f97316' }}
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
              </div>
            );
          })()}
        </div>
      </section>
    );
  }

  // ========== BOLD STARTER - Stacked editorial cards ==========
  if (templateId === 'bold-starter') {
    const symmetricalCount = getSymmetricalCount(validTestimonials.length, 2);
    const displayTestimonials = validTestimonials.slice(0, symmetricalCount);

    return (
      <section ref={containerRef} className="py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
              {title}
            </h2>
            <div 
              className="h-1.5 w-24 mt-6"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            />
          </motion.div>

          {/* Testimonial cards grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {displayTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="group relative"
              >
                <div 
                  className="relative p-8 md:p-10 rounded-none border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  {/* Large decorative quote number */}
                  <span 
                    className="absolute top-4 right-6 text-[8rem] font-black leading-none opacity-[0.04] select-none pointer-events-none"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Quote icon */}
                  <div 
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${primaryColor || '#3b82f6'}20` }}
                  >
                    <Quote 
                      className="w-5 h-5" 
                      style={{ color: primaryColor || '#3b82f6' }} 
                    />
                  </div>

                  {/* Quote text */}
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 font-medium">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div 
                      className="w-11 h-11 rounded-sm flex items-center justify-center text-white text-lg font-black"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      {testimonial.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm uppercase tracking-wider">
                        {testimonial.author}
                      </p>
                      {testimonial.role && (
                        <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL - 3D perspective carousel ==========
  if (templateId === 'modern-professional') {
    const goNext = () => setActiveIndex((prev) => (prev + 1) % validTestimonials.length);
    const goPrev = () => setActiveIndex((prev) => (prev - 1 + validTestimonials.length) % validTestimonials.length);

    return (
      <section ref={containerRef} className="py-32 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              {title}
            </h2>
            <div 
              className="w-16 h-1"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            />
          </motion.div>

          {/* 3D Carousel */}
          <div className="relative" style={{ perspective: '1000px' }}>
            <div className="flex items-center justify-center min-h-[400px]">
              {validTestimonials.map((testimonial, index) => {
                const offset = index - activeIndex;
                const isActive = index === activeIndex;
                
                return (
                  <motion.div
                    key={index}
                    animate={{
                      rotateY: offset * 30,
                      x: offset * 300,
                      z: isActive ? 0 : -200,
                      opacity: Math.abs(offset) > 1 ? 0 : 1 - Math.abs(offset) * 0.5,
                      scale: isActive ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-full max-w-2xl"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      zIndex: isActive ? 10 : 5 - Math.abs(offset),
                    }}
                  >
                    <div className="p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <Quote 
                        className="w-12 h-12 mb-6"
                        style={{ color: primaryColor || '#3b82f6', opacity: 0.5 }}
                      />
                      <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: primaryColor || '#3b82f6' }}
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
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={goPrev}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goNext}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC - Clean fade between quotes ==========

  return (
    <section ref={containerRef} className="py-32 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h2>
          <div 
            className="w-20 h-1 mx-auto"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </motion.div>

        {/* Single large quote with fade */}
        <div className="text-center min-h-[250px]">
          <Quote 
            className="w-16 h-16 mx-auto mb-8 opacity-20"
            style={{ color: primaryColor || 'hsl(var(--primary))' }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed mb-10">
                "{validTestimonials[activeIndex]?.quote}"
              </p>
              <p className="text-lg font-semibold text-foreground">
                {validTestimonials[activeIndex]?.author}
              </p>
              {validTestimonials[activeIndex]?.role && (
                <p className="text-muted-foreground mt-1">
                  {validTestimonials[activeIndex].role}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-3 mt-12">
          {validTestimonials.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'scale-125' : 'opacity-30 hover:opacity-60'
              }`}
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
