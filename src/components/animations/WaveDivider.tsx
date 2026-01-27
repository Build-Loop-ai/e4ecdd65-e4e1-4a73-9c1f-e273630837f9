'use client';

import { motion } from 'framer-motion';

interface WaveDividerProps {
  position?: 'top' | 'bottom';
  color?: string;
  className?: string;
  animated?: boolean;
  variant?: 'wave' | 'curve' | 'zigzag';
}

export function WaveDivider({ 
  position = 'bottom', 
  color = 'hsl(var(--background))',
  className = '',
  animated = false,
  variant = 'wave'
}: WaveDividerProps) {
  const isTop = position === 'top';
  
  const paths = {
    wave: "M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z",
    curve: "M0,96L1440,32L1440,120L0,120Z",
    zigzag: "M0,64L120,80L240,64L360,80L480,64L600,80L720,64L840,80L960,64L1080,80L1200,64L1320,80L1440,64L1440,120L0,120Z",
  };

  return (
    <div 
      className={`absolute ${isTop ? 'top-0 rotate-180' : 'bottom-0'} left-0 right-0 ${className}`}
      style={{ transform: isTop ? 'rotate(180deg)' : undefined }}
    >
      <motion.svg 
        viewBox="0 0 1440 120" 
        className="w-full h-16 md:h-24"
        preserveAspectRatio="none"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8 }}
      >
        <motion.path 
          d={paths[variant]}
          fill={color}
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  );
}
