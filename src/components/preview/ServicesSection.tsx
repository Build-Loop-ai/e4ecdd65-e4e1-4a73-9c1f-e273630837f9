'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Service {
  title: string;
  description: string;
  image?: string | null;
}

interface ServicesSectionProps {
  services: Service[];
  title?: string;
  isModern?: boolean;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function ServicesSection({
  services,
  title = 'Our Services',
  isModern = false,
  primaryColor,
  templateId,
}: ServicesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Require minimum 2 services to show dedicated section
  if (!services || services.length < 2) return null;

  // Helper function to get symmetrical display count and grid columns
  const getSymmetricalLayout = (count: number, maxCols: number = 3) => {
    // For grid with max 3 columns: valid symmetrical counts are 2, 3, 4, 6, 9, 12
    // For grid with max 2 columns: valid symmetrical counts are 2, 4, 6, 8
    if (maxCols === 3) {
      if (count <= 2) return { limit: 2, cols: 'md:grid-cols-2' };
      if (count === 3) return { limit: 3, cols: 'md:grid-cols-3' };
      if (count === 4) return { limit: 4, cols: 'md:grid-cols-2' }; // 2x2 grid
      if (count === 5) return { limit: 4, cols: 'md:grid-cols-2' }; // Drop 1 for 2x2
      if (count === 6) return { limit: 6, cols: 'md:grid-cols-2 lg:grid-cols-3' }; // 2x3 or 3x2
      if (count === 7) return { limit: 6, cols: 'md:grid-cols-2 lg:grid-cols-3' }; // Drop 1
      if (count === 8) return { limit: 6, cols: 'md:grid-cols-2 lg:grid-cols-3' }; // Drop 2
      if (count >= 9) return { limit: 9, cols: 'md:grid-cols-3' }; // 3x3
      return { limit: 6, cols: 'md:grid-cols-2 lg:grid-cols-3' };
    }
    // For 2-column layouts
    if (count <= 2) return { limit: 2, cols: 'md:grid-cols-2' };
    if (count === 3) return { limit: 2, cols: 'md:grid-cols-2' }; // Drop 1 for 2
    if (count === 4) return { limit: 4, cols: 'md:grid-cols-2' };
    if (count === 5) return { limit: 4, cols: 'md:grid-cols-2' };
    if (count >= 6) return { limit: 6, cols: 'md:grid-cols-2' };
    return { limit: 4, cols: 'md:grid-cols-2' };
  };

  // ========== ELEGANT MINIMAL - Numbered list with animated underline on hover ==========
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-32 bg-background">
        <div className="container mx-auto max-w-3xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
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
              transition={{ duration: 1, delay: 0.3 }}
              className="w-16 h-px mx-auto origin-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Numbered list with line animation */}
          <div className="space-y-0">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group cursor-pointer py-8 border-b border-border/30"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-start gap-8">
                  <span 
                    className="text-sm text-muted-foreground/40 font-light tracking-widest pt-1 transition-colors duration-500 group-hover:text-foreground/60"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 
                        className="text-xl font-normal text-foreground transition-all duration-500"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {service.title}
                      </h3>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: hoveredIndex === index ? 1 : 0, x: hoveredIndex === index ? 0 : -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm max-w-lg">
                      {service.description}
                    </p>
                    {/* Animated underline */}
                    <motion.div 
                      className="h-px mt-6 origin-left"
                      style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: hoveredIndex === index ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== WARM FRIENDLY - Rounded icon cards with wobble hover effect ==========
  if (effectiveTemplateId === 'warm-friendly') {
    const layout = getSymmetricalLayout(services.length, 3);
    const displayServices = services.slice(0, layout.limit);

    return (
      <section ref={containerRef} className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {title} 🎯
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || '#f97316' }}
            />
          </motion.div>

          {/* Wobble cards grid - symmetrical */}
          <div className={`grid ${layout.cols} gap-6`}>
            {displayServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', bounce: 0.4 }}
                whileHover={{ 
                  scale: 1.02, 
                  rotate: [0, -1, 1, -1, 0],
                  transition: { rotate: { duration: 0.4 } }
                }}
                className="group bg-white rounded-3xl p-7 shadow-lg shadow-orange-100/40 border border-orange-100/60 cursor-pointer transition-shadow hover:shadow-xl"
              >
                {/* Icon */}
                <motion.div 
                  className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', bounce: 0.6 }}
                >
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div 
                      className="w-6 h-6 rounded-lg"
                      style={{ backgroundColor: primaryColor || '#f97316' }}
                    />
                  )}
                </motion.div>
                
                <h3 className="text-lg font-bold mb-3 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== BOLD STARTER - Full-width stacked sections with sticky scroll reveal ==========
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="bg-[#0a0a0a] relative">
        {/* Header */}
        <div className="sticky top-0 z-10 py-16 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-7xl px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tight"
            >
              {title}
            </motion.h2>
          </div>
        </div>

        {/* Stacked full-width sections */}
        <div className="relative">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
              className="lg:sticky lg:top-32 min-h-[50vh] lg:min-h-[70vh] flex items-center"
              style={{ 
                zIndex: index + 1,
                backgroundColor: '#0a0a0a',
              }}
            >
              <div className="container mx-auto max-w-7xl px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <motion.span 
                      className="text-6xl md:text-7xl lg:text-9xl font-black opacity-10 block mb-4"
                      style={{ color: primaryColor || '#3b82f6' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </motion.span>
                    <h3 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-6">
                      {service.title}
                    </h3>
                    <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-lg">
                      {service.description}
                    </p>
                  </div>
                  
                  {service.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="aspect-[4/3] rounded-2xl overflow-hidden"
                    >
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Gradient line separator */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${primaryColor || '#3b82f6'}50 50%, transparent 100%)`
                }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* Spacer for last sticky element */}
        <div className="h-32" />
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL - Bento grid with mixed sizes ==========
  if (effectiveTemplateId === 'modern-professional') {
    // For bento grid, limit to symmetrical counts that work well
    const getSymmetricalBentoCount = (count: number) => {
      if (count <= 2) return 2;
      if (count === 3) return 3;
      if (count === 4) return 4;
      if (count === 5) return 4; // Drop 1
      if (count >= 6) return 6;
      return 4;
    };

    const displayCount = getSymmetricalBentoCount(services.length);
    const displayServices = services.slice(0, displayCount);

    const getBentoClass = (index: number, total: number) => {
      // Create varied sizes based on index
      if (total >= 4) {
        if (index === 0) return 'md:col-span-2 md:row-span-2';
        if (index === 3) return 'md:col-span-2';
      }
      if (total === 3) {
        if (index === 0) return 'md:col-span-2';
      }
      return '';
    };

    return (
      <section ref={containerRef} className="py-32 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-10 blur-[150px]"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              {title}
            </h2>
            <div 
              className="w-20 h-1"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            />
          </motion.div>

          {/* Bento grid - symmetrical */}
          <div className="grid md:grid-cols-3 gap-6">
            {displayServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group ${getBentoClass(index, services.length)}`}
              >
                <div 
                  className="h-full p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 flex flex-col"
                >
                  {/* Number indicator */}
                  <div 
                    className="text-4xl font-bold mb-6 opacity-30"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {service.image && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-6">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  )}
                  
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed flex-1">
                    {service.description}
                  </p>

                  {/* Hover arrow */}
                  <motion.div 
                    className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    Meer info
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC - Clean professional cards ==========
  const corporateLayout = getSymmetricalLayout(services.length, 3);
  const corporateServices = services.slice(0, corporateLayout.limit);

  return (
    <section ref={containerRef} className="py-28 bg-slate-50 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Professionele services op maat gemaakt voor uw behoeften
          </p>
        </motion.div>

        {/* Cards grid - symmetrical */}
        <div className={`grid ${corporateLayout.cols} gap-8`}>
          {corporateServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1">
                {/* Service image or accent bar */}
                {service.image ? (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-12 h-1 rounded-full mb-6"
                    style={{ backgroundColor: primaryColor || '#1e40af' }}
                  />
                )}
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: primaryColor || '#1e40af' }}
                >
                  Meer informatie
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
