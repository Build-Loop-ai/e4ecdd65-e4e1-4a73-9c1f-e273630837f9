import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight } from 'lucide-react';

interface UpgradeBannerProps {
  type: 'pitches' | 'emails';
  used: number;
  limit: number;
  className?: string;
}

export function UpgradeBanner({ type, used, limit, className }: UpgradeBannerProps) {
  const navigate = useNavigate();
  const label = type === 'pitches' ? 'pitch' : 'email';

  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3 ${className ?? ''}`}>
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <Crown className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">
        Monthly {label} limit reached
      </h3>
      <p className="text-sm text-muted-foreground">
        You've used {used}/{limit} {label}s this month. Upgrade your plan for more.
      </p>
      <Button size="sm" onClick={() => navigate('/dashboard/settings', { state: { tab: 'billing' } })}>
        Upgrade Plan
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
