'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, className = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState('0');

  // Extract numeric part and suffix (like +, %, k, etc.)
  const numericMatch = value.match(/^([\d.,]+)(.*)$/);
  const targetNumber = numericMatch ? parseFloat(numericMatch[1].replace(',', '')) : 0;
  const suffix = numericMatch ? numericMatch[2] : '';
  const hasDecimal = value.includes('.');
  const decimalPlaces = hasDecimal ? (value.split('.')[1]?.match(/\d+/)?.[0]?.length || 0) : 0;

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = targetNumber * eased;
      
      setDisplayValue(
        hasDecimal 
          ? current.toFixed(decimalPlaces)
          : Math.floor(current).toLocaleString()
      );

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericMatch ? numericMatch[1] : value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, targetNumber, duration, hasDecimal, decimalPlaces, value, numericMatch]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {displayValue}{suffix}
    </motion.span>
  );
}
