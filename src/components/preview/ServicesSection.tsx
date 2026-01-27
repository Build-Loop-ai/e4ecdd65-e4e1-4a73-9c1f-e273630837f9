'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

interface Service {
  title: string;
  description: string;
  image?: string | null;
}

interface ServicesSectionProps {
  services: Service[];
  isModern?: boolean;
  primaryColor?: string;
}

export function ServicesSection({
  services,
  isModern = false,
  primaryColor,
}: ServicesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Require minimum 2 services to show dedicated section
  if (!services || services.length < 2) return null;

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
