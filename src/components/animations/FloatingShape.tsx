'use client';

import { motion } from 'framer-motion';

interface FloatingShapeProps {
  className?: string;
  color?: string;
  size?: number;
  blur?: number;
  duration?: number;
  delay?: number;
  shape?: 'circle' | 'blob' | 'square';
}

export function FloatingShape({ 
  className = '',
  color = 'hsl(var(--primary))',
  size = 400,
  blur = 100,
  duration = 20,
  delay = 0,
  shape = 'circle'
}: FloatingShapeProps) {
  const borderRadius = shape === 'circle' 
    ? '50%' 
    : shape === 'blob' 
      ? '60% 40% 30% 70% / 60% 30% 70% 40%' 
      : '20%';

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -40, 60, 0],
        scale: [1, 1.1, 0.95, 1],
        rotate: shape === 'blob' ? [0, 180, 360] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
