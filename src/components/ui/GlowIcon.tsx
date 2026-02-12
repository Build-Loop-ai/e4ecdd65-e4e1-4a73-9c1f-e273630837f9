import { cn } from '@/lib/utils';

type GlowVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface GlowIconProps {
  icon: React.ElementType;
  variant?: GlowVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<GlowVariant, string> = {
  primary: 'from-primary/20 to-primary/5 text-primary shadow-primary/10',
  success: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10',
  warning: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 shadow-amber-500/10',
  danger: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400 shadow-rose-500/10',
  info: 'from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400 shadow-sky-500/10',
  muted: 'from-muted-foreground/15 to-muted-foreground/5 text-muted-foreground shadow-muted-foreground/10',
};

const sizeStyles = {
  xs: { container: 'h-6 w-6 rounded-md shadow-sm', icon: 'h-3 w-3' },
  sm: { container: 'h-8 w-8 rounded-lg shadow-sm', icon: 'h-3.5 w-3.5' },
  md: { container: 'h-10 w-10 rounded-xl shadow-md', icon: 'h-4.5 w-4.5' },
  lg: { container: 'h-12 w-12 rounded-xl shadow-md', icon: 'h-5 w-5' },
};

export function GlowIcon({ icon: Icon, variant = 'primary', size = 'md', className }: GlowIconProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn(
      'relative flex items-center justify-center bg-gradient-to-br',
      s.container,
      variantStyles[variant],
      className
    )}>
      <Icon className={s.icon} strokeWidth={2.25} />
    </div>
  );
}
