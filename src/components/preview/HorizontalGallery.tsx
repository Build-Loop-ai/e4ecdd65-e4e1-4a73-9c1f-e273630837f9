'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface HorizontalGalleryProps {
  images: string[];
  title?: string;
  primaryColor?: string;
}

export function HorizontalGallery({
  images,
  title = 'Gallery',
  primaryColor,
}: HorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  if (!images || images.length === 0) return null;

  // Filter out invalid images
  const validImages = images.filter(img => 
    img && 
    !img.includes('favicon') && 
    !img.includes('icon') &&
    (img.startsWith('http') || img.startsWith('/'))
  ).slice(0, 12);

  if (validImages.length === 0) return null;

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
