import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionData {
  subscribed: boolean;
  plan: 'free' | 'pro' | 'agency';
  product_id?: string;
  subscription_end?: string;
}

export const PLAN_LIMITS = {
  free: { pitches: 3, emails: 10, label: 'Free', price: 0 },
  pro: { pitches: -1, emails: 100, label: 'Pro', price: 29 },
  agency: { pitches: -1, emails: -1, label: 'Agency', price: 79 },
} as const;

export const PLAN_PRICES = {
  pro: 'price_1T02MsGs528xYuUTgi30NI8t',
  agency: 'price_1T02MtGs528xYuUTn83xi3Le',
} as const;

export function useSubscription() {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check error:', error);
        return { subscribed: false, plan: 'free' as const };
      }
      return data as SubscriptionData;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });

  const subscription = data ?? { subscribed: false, plan: 'free' as const };

  const startCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  return {
    subscription,
    isLoading,
    refetch,
    startCheckout,
    openPortal,
    limits: PLAN_LIMITS[subscription.plan],
  };
}
