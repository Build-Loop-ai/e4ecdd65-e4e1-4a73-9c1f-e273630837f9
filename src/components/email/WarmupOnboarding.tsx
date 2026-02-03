import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Clock, 
  Shield, 
  Mail, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface WarmupOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartWarmup: () => void;
  isLoading?: boolean;
  emailAddress?: string;
}

export function WarmupOnboarding({
  open,
  onOpenChange,
  onStartWarmup,
  isLoading = false,
  emailAddress,
}: WarmupOnboardingProps) {
  const steps = [
    {
      icon: Thermometer,
      title: 'Gradual Warm-up',
      description: 'We slowly increase sending volume over 2-4 weeks to build your sender reputation.',
    },
    {
      icon: Mail,
      title: 'Automated Engagement',
      description: 'Our system sends and receives warm-up emails automatically — no action needed from you.',
    },
    {
      icon: Shield,
      title: 'Reputation Protection',
      description: 'Your emails land in inbox, not spam. We monitor and protect your domain reputation.',
    },
  ];

  const whatYouCanDo = [
    { now: 'Send up to 5 emails/day', later: 'Send 50+ emails/day' },
    { now: 'Monitor warmup progress', later: 'Full sending capacity' },
    { now: 'See deliverability scores', later: 'Consistent inbox delivery' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-primary" />
            Enable Email Warmup
          </DialogTitle>
          <DialogDescription>
            Protect your sender reputation and ensure your emails reach the inbox
            {emailAddress && <span className="block mt-1 font-medium">{emailAddress}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* How it works */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">How it works</h4>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Expected Timeline: 2-4 weeks</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Now
                </p>
                {whatYouCanDo.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {item.now}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  After Warmup
                </p>
                {whatYouCanDo.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {item.later}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={onStartWarmup} disabled={isLoading}>
            {isLoading ? (
              'Enabling...'
            ) : (
              <>
                Start Warmup
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
