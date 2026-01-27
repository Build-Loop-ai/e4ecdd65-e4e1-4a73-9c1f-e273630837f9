'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  scale?: boolean;
}

export function ParallaxImage({ 
  src, 
  alt, 
  className = '', 
  speed = 0.5,
  scale = true
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}px`, `${speed * 100}px`]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], scale ? [1.1, 1, 1.1] : [1, 1, 1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ y, scale: scaleValue }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}
