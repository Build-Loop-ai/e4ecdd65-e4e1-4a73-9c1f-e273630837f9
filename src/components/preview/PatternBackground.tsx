'use client';

import { motion } from 'framer-motion';
import { getPatternConfig, getPatternColors, type PatternType } from '@/lib/heroPatterns';
import type { TemplateId } from '@/lib/templateStyles';

interface PatternBackgroundProps {
  patternType: PatternType;
  primaryColor?: string;
  templateId: TemplateId;
  className?: string;
}

export function PatternBackground({
  patternType,
  primaryColor,
  templateId,
  className = '',
}: PatternBackgroundProps) {
  const config = getPatternConfig(patternType);
  const colors = getPatternColors(templateId, primaryColor);
  const accentColor = primaryColor || colors.accent;

  // Tech circuit pattern - nodes and connection lines
  const TechCircuitPattern = () => (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="circuit-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path 
            d="M 60 0 L 0 0 0 60" 
            fill="none" 
            stroke={accentColor} 
            strokeWidth="0.5" 
            opacity="0.15"
          />
        </pattern>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      {/* Animated nodes */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={i}
          cx={`${15 + (i % 4) * 25}%`}
          cy={`${20 + Math.floor(i / 4) * 40}%`}
          r="4"
          fill="url(#node-glow)"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{ 
            duration: 3 + i * 0.5, 
            repeat: Infinity, 
            delay: i * 0.3,
          }}
        />
      ))}
      {/* Connection lines */}
      <motion.line
        x1="15%" y1="20%" x2="40%" y2="20%"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.2"
        animate={{ pathLength: [0, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.line
        x1="40%" y1="20%" x2="65%" y2="60%"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.2"
        animate={{ pathLength: [0, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
    </svg>
  );

  // Beauty waves pattern - soft flowing curves
  const BeautyWavesPattern = () => (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M0,${60 + i * 20} Q25,${40 + i * 20} 50,${60 + i * 20} T100,${60 + i * 20} V100 H0 Z`}
          fill="url(#wave-gradient)"
          opacity={0.3 - i * 0.08}
          animate={{
            d: [
              `M0,${60 + i * 20} Q25,${40 + i * 20} 50,${60 + i * 20} T100,${60 + i * 20} V100 H0 Z`,
              `M0,${55 + i * 20} Q25,${50 + i * 20} 50,${55 + i * 20} T100,${55 + i * 20} V100 H0 Z`,
              `M0,${60 + i * 20} Q25,${40 + i * 20} 50,${60 + i * 20} T100,${60 + i * 20} V100 H0 Z`,
            ],
          }}
          transition={{ 
            duration: 8 + i * 2, 
            repeat: Infinity, 
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'center' }}
        />
      ))}
    </svg>
  );

  // Food organic pattern - soft circles
  const FoodOrganicPattern = () => (
    <div className="absolute inset-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 200 + i * 50,
            height: 200 + i * 50,
            left: `${10 + (i % 3) * 30}%`,
            top: `${15 + Math.floor(i / 3) * 35}%`,
            backgroundColor: accentColor,
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        />
      ))}
    </div>
  );

  // Legal grid pattern - clean lines
  const LegalGridPattern = () => (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="legal-grid-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
          <path 
            d="M 80 0 L 0 0 0 80" 
            fill="none" 
            stroke={accentColor} 
            strokeWidth="0.3" 
            opacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#legal-grid-pattern)" />
      {/* Subtle accent lines */}
      <motion.line
        x1="0" y1="30%" x2="100%" y2="30%"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.05"
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.line
        x1="0" y1="70%" x2="100%" y2="70%"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.05"
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
    </svg>
  );

  // Creative blocks pattern - bold shapes
  const CreativeBlocksPattern = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 150 + i * 30,
            height: 150 + i * 30,
            left: `${5 + i * 25}%`,
            top: `${10 + (i % 2) * 40}%`,
            backgroundColor: accentColor,
            borderRadius: i % 2 === 0 ? '20%' : '50%',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            rotate: [0, 10, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );

  // Angular pattern - for construction/fitness
  const AngularPattern = () => (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="angular-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <motion.polygon
        points="0,100 30,60 60,80 100,40 100,100"
        fill="url(#angular-grad)"
        opacity="0.2"
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.polygon
        points="0,100 20,70 50,85 80,50 100,70 100,100"
        fill="url(#angular-grad)"
        opacity="0.15"
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
    </svg>
  );

  // Dots pattern - for retail
  const DotsPattern = () => (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="dots-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill={accentColor} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots-pattern)" />
      {/* Animated larger dots */}
      {[...Array(5)].map((_, i) => (
        <motion.circle
          key={i}
          cx={`${20 + i * 15}%`}
          cy={`${30 + (i % 2) * 30}%`}
          r="8"
          fill={accentColor}
          opacity="0.15"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ 
            duration: 5 + i, 
            repeat: Infinity, 
            delay: i * 0.4,
          }}
        />
      ))}
    </svg>
  );

  // Mesh gradient pattern - default sophisticated
  const MeshPattern = () => (
    <div className="absolute inset-0">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          left: '10%',
          top: '20%',
          background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          right: '15%',
          bottom: '20%',
          background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
          filter: 'blur(120px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
    </div>
  );

  // Render the appropriate pattern based on config
  const renderPattern = () => {
    switch (config.elements) {
      case 'lines':
        return <TechCircuitPattern />;
      case 'waves':
        return <BeautyWavesPattern />;
      case 'circles':
        return <FoodOrganicPattern />;
      case 'grid':
        return <LegalGridPattern />;
      case 'blocks':
        return <CreativeBlocksPattern />;
      case 'angular':
        return <AngularPattern />;
      case 'dots':
        return <DotsPattern />;
      case 'mesh':
      default:
        return <MeshPattern />;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${accentColor}15 50%, ${colors.bg} 100%)`,
        }}
      />
      
      {/* Pattern layer */}
      {renderPattern()}
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
