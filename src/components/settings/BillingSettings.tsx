import { useState } from 'react';
import { useSubscription, PLAN_LIMITS, PLAN_PRICES } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Crown, Zap, Building2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TIERS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: 0,
    description: 'Get started with the basics',
    icon: Zap,
    features: [
      '3 pitches per month',
      '10 emails per month',
      'Basic templates',
      'View tracking',
    ],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: 29,
    description: 'For serious freelancers',
    icon: Crown,
    popular: true,
    features: [
      'Unlimited pitches',
      '100 emails per month',
      'All premium templates',
      'Advanced analytics',
      'Email warmup',
      'Priority support',
    ],
  },
  {
    key: 'agency' as const,
    name: 'Agency',
    price: 79,
    description: 'For teams and agencies',
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited emails',
      'White-label pitches',
      'Team collaboration',
      'Custom branding',
      'Dedicated support',
    ],
  },
];

export function BillingSettings() {
  const { subscription, isLoading, startCheckout, openPortal } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async (plan: 'pro' | 'agency') => {
    setCheckoutLoading(plan);
    try {
      await startCheckout(PLAN_PRICES[plan]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current plan banner */}
      {subscription.subscribed && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              You're on the <span className="text-primary">{PLAN_LIMITS[subscription.plan].label}</span> plan
            </p>
            {subscription.subscription_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Renews {new Date(subscription.subscription_end).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Manage
          </Button>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = subscription.plan === tier.key;
          const isUpgrade = tier.price > PLAN_LIMITS[subscription.plan].price;

          return (
            <div
              key={tier.key}
              className={cn(
                'rounded-xl border p-5 relative transition-all',
                isCurrent && 'border-primary/40 bg-primary/5 ring-1 ring-primary/20',
                tier.popular && !isCurrent && 'border-primary/20',
                !isCurrent && !tier.popular && 'border-border'
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2.5">
                  Most Popular
                </Badge>
              )}

              {isCurrent && (
                <Badge variant="outline" className="absolute -top-2.5 left-1/2 -translate-x-1/2 border-primary text-primary text-[10px] px-2.5">
                  Current Plan
                </Badge>
              )}

              <div className="flex items-center gap-2 mb-3 mt-1">
                <tier.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{tier.name}</h3>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

              <ul className="space-y-2 mb-5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.key === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  {isCurrent ? 'Current Plan' : 'Free Forever'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || !!checkoutLoading}
                  onClick={() => isUpgrade ? handleUpgrade(tier.key) : handleManage()}
                >
                  {checkoutLoading === tier.key ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isCurrent ? 'Current Plan' : isUpgrade ? `Upgrade to ${tier.name}` : 'Change Plan'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
