'use client';

import { motion, useScroll, useTransform, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { ParallaxImage } from '@/components/animations/ParallaxImage';

interface GallerySectionProps {
  images: string[];
  title?: string;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function GallerySection({
  images,
  title = 'Ons Werk',
  primaryColor,
  templateId,
}: GallerySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [scrollX, setScrollX] = useState(0);
  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

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

  // ========== ELEGANT MINIMAL - Single large image with parallax ==========
  if (templateId === 'elegant-minimal') {
    return (
      <section ref={containerRef} className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
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
              transition={{ duration: 1, delay: 0.3 }}
              className="w-16 h-px mx-auto origin-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          {/* Large single images with generous spacing */}
          <div className="space-y-24">
            {validImages.slice(0, 4).map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.2 }}
                className="relative"
              >
                <ParallaxImage
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full aspect-[16/10] rounded-sm"
                  speed={0.3}
                  scale={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ========== WARM FRIENDLY - Polaroid-style with random rotations ==========
  if (templateId === 'warm-friendly') {
    const getRandomRotation = (index: number) => {
      const rotations = [-3, 2, -2, 3, -1, 2, -3, 1];
      return rotations[index % rotations.length];
    };

    // Get symmetrical image count and grid layout
    const getSymmetricalLayout = () => {
      const count = validImages.length;
      // Force symmetrical counts: 1, 2, 3, 4, 6, 8, 9, 12
      if (count === 1) return { cols: 'grid-cols-1 max-w-md', limit: 1 };
      if (count === 2) return { cols: 'grid-cols-2 max-w-2xl', limit: 2 };
      if (count === 3) return { cols: 'grid-cols-1 sm:grid-cols-3 max-w-4xl', limit: 3 };
      if (count === 4) return { cols: 'grid-cols-2 max-w-4xl', limit: 4 };
      if (count === 5) return { cols: 'grid-cols-2 max-w-4xl', limit: 4 }; // Drop 1 for symmetry
      if (count === 6) return { cols: 'grid-cols-2 sm:grid-cols-3 max-w-5xl', limit: 6 };
      if (count === 7) return { cols: 'grid-cols-2 sm:grid-cols-3 max-w-5xl', limit: 6 }; // Drop 1 for symmetry
      if (count === 8) return { cols: 'grid-cols-2 sm:grid-cols-4 max-w-6xl', limit: 8 };
      if (count >= 9) return { cols: 'grid-cols-2 sm:grid-cols-3 max-w-5xl', limit: 9 }; // 3x3 grid on desktop
      return { cols: 'grid-cols-2 max-w-4xl', limit: 8 };
    };

    const layout = getSymmetricalLayout();
    const displayImages = validImages.slice(0, layout.limit);

    return (
      <section ref={containerRef} className="py-24 overflow-hidden bg-white">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {title} 📸
            </h2>
            <div 
              className="w-20 h-1.5 mx-auto rounded-full"
              style={{ backgroundColor: primaryColor || '#f97316' }}
            />
          </motion.div>
        </div>

        {/* Polaroid gallery - responsive grid */}
        <div className={`grid ${layout.cols} gap-8 px-6 mx-auto`}>
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, rotate: getRandomRotation(index) }}
              whileInView={{ opacity: 1, y: 0, rotate: getRandomRotation(index) }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-3 pb-12 rounded-sm shadow-xl shadow-orange-100/50 cursor-pointer mx-auto"
              style={{ 
                transform: `rotate(${getRandomRotation(index)}deg)`,
              }}
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full aspect-square object-cover"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  // ========== BOLD STARTER - Masonry grid with lightbox ==========
  if (templateId === 'bold-starter') {
    return (
      <>
        <section ref={containerRef} className="py-32 bg-[#0a0a0a]">
          <div className="container mx-auto px-6 mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
            >
              {title}
            </motion.h2>
          </div>

          {/* Masonry grid */}
          <div className="container mx-auto px-6">
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {validImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="mb-4 break-inside-avoid group cursor-pointer"
                  onClick={() => setLightboxImage(image)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img 
                      src={image} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.parentElement!.parentElement!.style.display = 'none'; }}
                    />
                    {/* Hover overlay with zoom indicator */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-2xl">+</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={lightboxImage}
              alt="Gallery preview"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
        )}
      </>
    );
  }

  // ========== MODERN PROFESSIONAL - Infinite horizontal auto-scroll ==========
  if (templateId === 'modern-professional') {
    // Auto-scroll animation
    useAnimationFrame((time) => {
      scrollRef.current = (time / 50) % (validImages.length * 350);
      setScrollX(-scrollRef.current);
    });

    return (
      <section ref={containerRef} className="py-32 overflow-hidden bg-[#0a0a0a]">
        <div className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              {title}
            </h2>
            <div 
              className="w-16 h-1"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            />
          </motion.div>
        </div>

        {/* Infinite scroll strip */}
        <div className="relative">
          <motion.div 
            className="flex gap-6"
            style={{ x: scrollX }}
          >
            {/* Double the images for seamless loop */}
            {[...validImages, ...validImages].map((image, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[320px] md:w-[400px] aspect-[4/5] rounded-2xl overflow-hidden group"
              >
                <img 
                  src={image} 
                  alt={`Gallery ${(index % validImages.length) + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC - Static grid with staggered fade-in ==========
  return (
    <section ref={containerRef} className="py-32 bg-slate-50">
      <div className="container mx-auto px-6 max-w-7xl">
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

        {/* Grid with hover lift */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 group"
            >
              <img 
                src={image} 
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
