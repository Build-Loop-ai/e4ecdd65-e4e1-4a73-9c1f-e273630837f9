import { cn } from '@/lib/utils';

interface GlowIconProps {
  icon: React.ElementType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  /** @deprecated All icons now use brand primary. Kept for API compat. */
  variant?: string;
}

const sizeStyles = {
  xs: { container: 'h-6 w-6 rounded-md shadow-sm', icon: 'h-3 w-3' },
  sm: { container: 'h-8 w-8 rounded-lg shadow-sm', icon: 'h-3.5 w-3.5' },
  md: { container: 'h-10 w-10 rounded-xl shadow-md', icon: 'h-4.5 w-4.5' },
  lg: { container: 'h-12 w-12 rounded-xl shadow-md', icon: 'h-5 w-5' },
};

export function GlowIcon({ icon: Icon, size = 'md', className }: GlowIconProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn(
      'relative flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-primary/10',
      s.container,
      className
    )}>
      <Icon className={s.icon} strokeWidth={2.25} />
    </div>
  );
}
