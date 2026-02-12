import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function getFunctionInvokeErrorMessage(err: unknown): string | null {
  const anyErr = err as any;
  // supabase-js FunctionError typically has `context` with `body` (string)
  const body = anyErr?.context?.body;
  if (typeof body === 'string' && body.length) {
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed?.error === 'string') return parsed.error;
      if (typeof parsed?.message === 'string') return parsed.message;
    } catch {
      // if it's plain text, just surface it
      return body;
    }
  }
  // sometimes it's already structured
  const structured = anyErr?.context?.json;
  if (structured && typeof structured === 'object') {
    if (typeof structured.error === 'string') return structured.error;
    if (typeof structured.message === 'string') return structured.message;
  }
  return null;
}

export interface WarmyConnection {
  id: string;
  email_address: string;
  provider: string;
  is_active: boolean;
  warmy_mailbox_id: number | null;
  warmy_state: 'active' | 'paused' | 'disconnected' | null;
  deliverability_score: number | null;
  placement_score: number | null;
  dns_score: number | null;
  warmy_temperature: number | null;
  last_warmy_sync: string | null;
  daily_send_limit: number | null;
  emails_sent_today: number | null;
  last_send_count_reset: string | null;
  warmup_started_at: string | null;
}

export interface WarmyMailboxDetails {
  sent_today?: number;
  received_today?: number;
  warmup_active?: boolean;
  dns_records?: {
    spf?: boolean;
    dkim?: boolean;
    dmarc?: boolean;
    mx_record?: boolean;
    a_record?: boolean;
    r_dns?: boolean;
  };
  latest_deliverability_test?: {
    google?: number;
    outlook?: number;
    yahoo?: number;
    tested_at?: string;
  };
}

export interface WarmyAlert {
  id: string;
  domain: string;
  message: string;
  state: string;
  created_at: string;
}

export function useWarmyStatus() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WarmyConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alerts, setAlerts] = useState<WarmyAlert[]>([]);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('id, email_address, provider, is_active, warmy_mailbox_id, warmy_state, deliverability_score, placement_score, dns_score, warmy_temperature, last_warmy_sync, daily_send_limit, emails_sent_today, last_send_count_reset, warmup_started_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections((data as WarmyConnection[]) || []);
    } catch (error: any) {
      console.error('Error fetching Warmy connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const registerWithWarmy = useCallback(async (connectionId: string, fromName?: string) => {
    try {
      const response = await supabase.functions.invoke('warmy-register', {
        body: { connection_id: connectionId, from_name: fromName },
      });

      if (response.error) {
        // Extract detailed error from response body
        const detailedMsg = getFunctionInvokeErrorMessage(response.error);
        const rawMsg = detailedMsg || response.error.message || 'Failed to register with Warmy';
        
        // Check for plan upgrade error
        if (rawMsg.toLowerCase().includes('upgrade') || rawMsg.toLowerCase().includes('tariff')) {
          toast.error('Your Warmy.io plan doesn\'t support additional mailboxes. Please upgrade your Warmy plan first.', { duration: 6000 });
          return false;
        }
        
        throw new Error(rawMsg);
      }

      toast.success('Email warmup enabled!');
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('Warmy register error:', error);
      toast.error(error.message || 'Failed to enable warmup');
      return false;
    }
  }, [fetchConnections]);

  const syncScores = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await supabase.functions.invoke('warmy-sync', {});

      if (response.error) {
        throw new Error(response.error.message || 'Failed to sync');
      }

      toast.success('Scores synced');
      await fetchConnections();
    } catch (error: any) {
      console.error('Warmy sync error:', error);
      toast.error(error.message || 'Failed to sync scores');
    } finally {
      setIsSyncing(false);
    }
  }, [fetchConnections]);

  const pauseWarmup = useCallback(async (connectionId: string) => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'pause', connection_id: connectionId },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to pause';
        throw new Error(msg);
      }

      toast.success('Warmup paused');
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('Pause error:', error);
      toast.error(error.message || 'Failed to pause warmup');
      return false;
    }
  }, [fetchConnections]);

  const resumeWarmup = useCallback(async (connectionId: string) => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'resume', connection_id: connectionId },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to resume';
        throw new Error(msg);
      }

      toast.success('Warmup resumed');
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('Resume error:', error);
      toast.error(error.message || 'Failed to resume warmup');
      return false;
    }
  }, [fetchConnections]);

  const runDeliverabilityTest = useCallback(async (connectionId: string, providers?: string[]) => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'test', connection_id: connectionId, providers },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to run test';
        throw new Error(msg);
      }

      toast.success('Deliverability test started. Results will be available shortly.');
      return response.data?.data;
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(error.message || 'Failed to run deliverability test');
      return null;
    }
  }, []);

  const disconnectFromWarmy = useCallback(async (connectionId: string) => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'disconnect', connection_id: connectionId },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to disconnect';
        throw new Error(msg);
      }

      toast.success('Disconnected from Warmy');
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error(error.message || 'Failed to disconnect from Warmy');
      return false;
    }
  }, [fetchConnections]);

  const getMailboxDetails = useCallback(async (connectionId: string): Promise<WarmyMailboxDetails | null> => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'get_details', connection_id: connectionId },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to get details';
        throw new Error(msg);
      }

      return response.data?.data || null;
    } catch (error: any) {
      console.error('Get details error:', error);
      toast.error(error.message || 'Failed to get mailbox details');
      return null;
    }
  }, []);

  const getAlerts = useCallback(async (connectionId: string): Promise<WarmyAlert[]> => {
    try {
      const response = await supabase.functions.invoke('warmy-actions', {
        body: { action: 'get_alerts', connection_id: connectionId },
      });

      if (response.error) {
        const msg =
          getFunctionInvokeErrorMessage(response.error) ||
          response.error.message ||
          'Failed to get alerts';
        throw new Error(msg);
      }

      const alertsData = response.data?.data || [];
      setAlerts(alertsData);
      return alertsData;
    } catch (error: any) {
      console.error('Get alerts error:', error);
      return [];
    }
  }, []);

  // Computed values
  const realWarmyConnections = connections.filter(c => c.warmy_mailbox_id !== null);
  
  const warmyConnections = realWarmyConnections;
  const averageDeliverability = warmyConnections.length > 0
    ? Math.round(warmyConnections.reduce((sum, c) => sum + (c.deliverability_score || 0), 0) / warmyConnections.length)
    : null;
  const connectionsNeedingAttention = warmyConnections.filter(c => (c.deliverability_score || 100) < 70);

  return {
    connections,
    warmyConnections,
    isLoading,
    isSyncing,
    alerts,
    averageDeliverability,
    connectionsNeedingAttention,
    registerWithWarmy,
    syncScores,
    pauseWarmup,
    resumeWarmup,
    runDeliverabilityTest,
    disconnectFromWarmy,
    getMailboxDetails,
    getAlerts,
    refetch: fetchConnections,
  };
}
