'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface HorizontalGalleryProps {
  images: string[];
  title?: string;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function HorizontalGallery({
  images,
  title = 'Gallery',
  primaryColor,
  templateId,
}: HorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const template = getTemplateStyle(templateId);

  // Filter out invalid images
  const validImages = images?.filter(img => 
    img && 
    !img.includes('favicon') && 
    !img.includes('icon') &&
    !img.includes('placeholder') &&
    !img.includes('default') &&
    (img.startsWith('http') || img.startsWith('/'))
  ).slice(0, 12) || [];

  // Require minimum 3 valid images to show gallery section
  if (validImages.length < 3) return null;

  // Elegant Minimal variant
  if (templateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-32 overflow-hidden bg-background">
        <div className="container mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 
              className="text-3xl md:text-4xl font-light tracking-tight mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>
            <div 
              className="w-16 h-px mx-auto"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>
        </div>

        {/* Gallery with more spacing */}
        <motion.div 
          style={{ x }}
          className="flex gap-10 pl-6"
        >
          {validImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative flex-shrink-0 w-[400px] md:w-[500px] aspect-[3/4] overflow-hidden group"
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  // Warm Friendly variant
  if (templateId === 'warm-friendly') {
    return (
      <section ref={containerRef} className="py-24 overflow-hidden bg-gradient-to-b from-background to-orange-50/30">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {title}
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>
        </div>

        {/* Rounded gallery */}
        <motion.div 
          style={{ x }}
          className="flex gap-6 pl-6"
        >
          {validImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex-shrink-0 w-[300px] md:w-[380px] aspect-[4/5] rounded-3xl overflow-hidden group shadow-lg shadow-orange-100/30"
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
              {/* Warm overlay on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: primaryColor || '#f97316' }}
              />
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
              {title}
            </h2>
          </motion.div>
        </div>

        {/* Overlapping gallery with gradient overlays */}
        <motion.div 
          style={{ x }}
          className="flex gap-4 pl-6"
        >
          {validImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex-shrink-0 w-[320px] md:w-[420px] aspect-[4/5] rounded-2xl overflow-hidden group"
              style={{ marginLeft: index > 0 ? '-40px' : '0' }}
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0 opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}50 0%, transparent 100%)` 
                }}
              />
              {/* Border glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ 
                  boxShadow: `inset 0 0 40px -10px ${primaryColor || '#3b82f6'}` 
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  // Default: Modern Professional / Corporate Classic
  return (
    <section ref={containerRef} className="py-24 overflow-hidden bg-foreground">
      <div className="container mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-background tracking-tight">
            {title}
          </h2>
          <div 
            className="w-16 h-1 mt-6"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </motion.div>
      </div>

      {/* Horizontal scrolling gallery */}
      <motion.div 
        style={{ x }}
        className="flex gap-6 pl-6"
      >
        {validImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative flex-shrink-0 w-[350px] md:w-[450px] aspect-[4/5] rounded-2xl overflow-hidden group"
          >
            <img 
              src={image} 
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
