import { motion } from 'framer-motion';
import { Mail, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SendingCapacityBarProps {
  sent: number;
  limit: number;
  size?: 'sm' | 'md';
  showWarning?: boolean;
  className?: string;
}

export function SendingCapacityBar({ 
  sent, 
  limit, 
  size = 'md',
  showWarning = true,
  className 
}: SendingCapacityBarProps) {
  const percentage = Math.min((sent / limit) * 100, 100);
  const remaining = Math.max(limit - sent, 0);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getBarColor = () => {
    if (isAtLimit) return 'bg-destructive';
    return 'bg-primary';
  };

  const sizeClasses = {
    sm: {
      container: 'h-1.5',
      text: 'text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'h-2',
      text: 'text-sm',
      icon: 'h-4 w-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Mail className={cn(classes.icon, 'text-muted-foreground')} />
          <span className={cn(classes.text, 'text-muted-foreground')}>
            Today's Capacity
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(classes.text, 'font-medium')}>
            {sent}/{limit} sent
          </span>
          {showWarning && isNearLimit && !isAtLimit && (
            <AlertTriangle className="h-3.5 w-3.5 text-primary/70" />
          )}
          {showWarning && isAtLimit && (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          )}
        </div>
      </div>
      
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', classes.container)}>
        <motion.div
          className={cn('h-full rounded-full', getBarColor())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {isAtLimit && showWarning && (
        <p className="text-xs text-destructive">
          Daily limit reached. Sending will resume tomorrow.
        </p>
      )}
    </div>
  );
}
