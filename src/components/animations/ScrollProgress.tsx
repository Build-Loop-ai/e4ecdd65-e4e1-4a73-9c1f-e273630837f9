'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
}

export function ScrollProgress({ 
  className = '',
  color = 'hsl(var(--primary))',
  height = 3,
  position = 'top'
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{
        height,
        backgroundColor: color,
        scaleX,
        transformOrigin: 'left',
      }}
    />
  );
}
