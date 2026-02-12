import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export interface SubscriptionData {
  subscribed: boolean;
  plan: 'free' | 'pro' | 'agency';
  product_id?: string;
  subscription_end?: string;
  pitches_used: number;
  emails_used: number;
  limits: { pitches: number; emails: number };
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

const DEFAULT_SUB: SubscriptionData = {
  subscribed: false,
  plan: 'free',
  pitches_used: 0,
  emails_used: 0,
  limits: { pitches: 3, emails: 10 },
};

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check error:', error);
        return DEFAULT_SUB;
      }
      return data as SubscriptionData;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });

  const subscription = data ?? DEFAULT_SUB;

  const canCreatePitch = useCallback(() => {
    const limit = PLAN_LIMITS[subscription.plan].pitches;
    if (limit === -1) return true;
    return subscription.pitches_used < limit;
  }, [subscription]);

  const canSendEmail = useCallback(() => {
    const limit = PLAN_LIMITS[subscription.plan].emails;
    if (limit === -1) return true;
    return subscription.emails_used < limit;
  }, [subscription]);

  const remainingPitches = useCallback(() => {
    const limit = PLAN_LIMITS[subscription.plan].pitches;
    if (limit === -1) return Infinity;
    return Math.max(0, limit - subscription.pitches_used);
  }, [subscription]);

  const remainingEmails = useCallback(() => {
    const limit = PLAN_LIMITS[subscription.plan].emails;
    if (limit === -1) return Infinity;
    return Math.max(0, limit - subscription.emails_used);
  }, [subscription]);

  const incrementPitchUsage = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('subscriptions')
      .update({ pitches_used: subscription.pitches_used + 1 })
      .eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
  }, [user, subscription.pitches_used, queryClient]);

  const incrementEmailUsage = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('subscriptions')
      .update({ emails_used: subscription.emails_used + 1 })
      .eq('user_id', user.id);
    queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
  }, [user, subscription.emails_used, queryClient]);

  const startCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  };

  return {
    subscription,
    isLoading,
    refetch,
    startCheckout,
    openPortal,
    limits: PLAN_LIMITS[subscription.plan],
    canCreatePitch,
    canSendEmail,
    remainingPitches,
    remainingEmails,
    incrementPitchUsage,
    incrementEmailUsage,
  };
}
