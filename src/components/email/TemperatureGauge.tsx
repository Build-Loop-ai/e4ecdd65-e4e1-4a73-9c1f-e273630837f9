import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemperatureGaugeProps {
  temperature: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function TemperatureGauge({ 
  temperature, 
  size = 'md', 
  showLabel = true,
  className 
}: TemperatureGaugeProps) {
  const getTemperatureLabel = (temp: number) => {
    if (temp >= 85) return 'Ready';
    if (temp >= 60) return 'Almost Ready';
    if (temp >= 30) return 'Warming Up';
    return 'Cold Start';
  };

  const sizeClasses = {
    sm: {
      container: 'h-1.5',
      icon: 'h-3 w-3',
      text: 'text-xs',
      value: 'text-sm',
    },
    md: {
      container: 'h-2',
      icon: 'h-4 w-4',
      text: 'text-sm',
      value: 'text-lg',
    },
    lg: {
      container: 'h-3',
      icon: 'h-5 w-5',
      text: 'text-base',
      value: 'text-2xl',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Thermometer className={cn(classes.icon, 'text-primary')} />
            <span className={cn(classes.text, 'text-muted-foreground')}>
              Temperature
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(classes.value, 'font-bold text-primary')}>
              {temperature}°
            </span>
            <span className={cn(classes.text, 'text-muted-foreground')}>
              {getTemperatureLabel(temperature)}
            </span>
          </div>
        </div>
      )}
      
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', classes.container)}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
          initial={{ width: 0 }}
          animate={{ width: `${temperature}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
