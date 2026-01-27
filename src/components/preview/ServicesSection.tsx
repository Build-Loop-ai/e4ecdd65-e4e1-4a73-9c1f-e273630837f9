'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface Service {
  title: string;
  description: string;
  image?: string | null;
}

interface ServicesSectionProps {
  services: Service[];
  isModern?: boolean;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function ServicesSection({
  services,
  isModern = false,
  primaryColor,
  templateId,
}: ServicesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  // Require minimum 2 services to show dedicated section
  if (!services || services.length < 2) return null;

  // Elegant Minimal variant
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-32 bg-background">
        <div className="container mx-auto max-w-3xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 
              className="text-3xl md:text-4xl font-light tracking-tight mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Wat wij doen
            </h2>
            <div 
              className="w-16 h-px mx-auto"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Single column clean list */}
          <div className="space-y-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-8">
                  <span 
                    className="text-sm text-muted-foreground/50 font-light mt-1"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-3 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    <div 
                      className="w-full h-px mt-8 opacity-10"
                      style={{ backgroundColor: primaryColor || 'hsl(var(--foreground))' }}
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

  // Warm Friendly variant
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="py-24 bg-gradient-to-b from-orange-50/30 to-background">
        <div className="container mx-auto max-w-6xl px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Wat wij doen
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Cozy grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-6 shadow-lg shadow-orange-100/30 border border-orange-100/50 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon/Image */}
                <div 
                  className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}15` }}
                >
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                    />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground">
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

  // Bold Starter variant
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section ref={containerRef} className="py-32 bg-black relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${primaryColor || '#3b82f6'}30 0%, transparent 70%)`
          }}
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
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
              style={{ 
                background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Wat wij doen
            </h2>
          </motion.div>

          {/* Glassmorphism grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div 
                  className="h-full p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
                  style={{
                    boxShadow: `0 0 40px -10px ${primaryColor || '#3b82f6'}30`
                  }}
                >
                  {/* Number */}
                  <div 
                    className="text-5xl font-black mb-4 opacity-20"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 40px -10px ${primaryColor || '#3b82f6'}50`
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default: Modern Professional / Corporate Classic (masonry style)
  return (
    <section ref={containerRef} className="py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02]"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${primaryColor || 'hsl(var(--primary))'} 0%, transparent 70%)`
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Wat wij doen
          </h2>
          <div 
            className="w-20 h-1.5"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </motion.div>

        {/* Services grid - masonry style */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`group relative ${index % 3 === 0 ? 'md:col-span-2' : ''}`}
            >
              <div 
                className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
                  index % 3 === 0 ? 'aspect-[2/1]' : 'aspect-[4/3]'
                }`}
              >
                {/* Background - image or gradient */}
                {service.image ? (
                  <>
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </>
                ) : (
                  <div 
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor || 'hsl(var(--primary))'}15 0%, ${primaryColor || 'hsl(var(--primary))'}05 100%)`
                    }}
                  />
                )}

                {/* Content overlay */}
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                  {/* Number indicator */}
                  <motion.div 
                    className="absolute top-8 left-8 text-6xl md:text-8xl font-black opacity-10"
                    style={{ color: service.image ? 'white' : (primaryColor || 'hsl(var(--primary))') }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </motion.div>

                  <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${service.image ? 'text-white' : 'text-foreground'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-base md:text-lg leading-relaxed max-w-xl ${service.image ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {service.description}
                  </p>

                  {/* Hover indicator */}
                  <motion.div 
                    className="absolute bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
