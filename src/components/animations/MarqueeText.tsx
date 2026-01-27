'use client';

import { motion } from 'framer-motion';

interface MarqueeTextProps {
  children: string;
  className?: string;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export function MarqueeText({ 
  children, 
  className = '', 
  speed = 20,
  direction = 'left',
  pauseOnHover = true
}: MarqueeTextProps) {
  const baseVelocity = direction === 'left' ? -speed : speed;
  
  // Duplicate content for seamless loop
  const content = `${children} • ${children} • ${children} • ${children} • `;

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 100 / speed,
            ease: 'linear',
          },
        }}
        whileHover={pauseOnHover ? { animationPlayState: 'paused' } : undefined}
        style={{ willChange: 'transform' }}
      >
        <span className="flex-shrink-0">{content}</span>
        <span className="flex-shrink-0">{content}</span>
      </motion.div>
    </div>
  );
}
