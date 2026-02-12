import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import pitchLogoIcon from '@/assets/pitch-logo.png';

interface PitchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PitchLogo({ className, size = 'md', showText = true }: PitchLogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <Link to="/dashboard" className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity', className)}>
      <img 
        src={pitchLogoIcon} 
        alt="Pitch" 
        className={cn('object-contain', s.icon)}
      />
      {showText && (
        <span className={cn('font-semibold text-foreground tracking-tight', s.text)}>
          Pitch
        </span>
      )}
    </Link>
  );
}
