import { cn } from '@/lib/utils';

interface PitchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PitchLogo({ className, size = 'md', showText = true }: PitchLogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-base', arrow: 'h-3 w-3' },
    md: { icon: 'w-8 h-8', text: 'text-lg', arrow: 'h-4 w-4' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', arrow: 'h-6 w-6' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo icon: P with arrow emerging */}
      <div className={cn(
        'rounded-lg bg-primary flex items-center justify-center relative',
        s.icon
      )}>
        {/* The P */}
        <span className="text-primary-foreground font-bold tracking-tight" style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : '28px' }}>
          P
        </span>
        {/* Arrow emerging from P */}
        <svg 
          className={cn('absolute text-primary-foreground', s.arrow)}
          style={{ 
            top: size === 'sm' ? '2px' : size === 'md' ? '3px' : '5px', 
            right: size === 'sm' ? '2px' : size === 'md' ? '3px' : '5px' 
          }}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn('font-semibold text-foreground tracking-tight', s.text)}>
          Pitch
        </span>
      )}
    </div>
  );
}
