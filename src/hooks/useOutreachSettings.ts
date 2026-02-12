import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OutreachSettings {
  id: string;
  user_id: string;
  auto_send_enabled: boolean;
  daily_cap: number;
  send_window_start: number;
  send_window_end: number;
  followup_enabled: boolean;
  tone: string;
  created_at: string;
  updated_at: string;
}

export function useOutreachSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['outreach-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await (supabase as any)
        .from('outreach_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return (data as OutreachSettings | null);
    },
    enabled: !!user?.id,
  });

  const upsert = useMutation({
    mutationFn: async (updates: Partial<OutreachSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (settings) {
        const { error } = await (supabase as any)
          .from('outreach_settings')
          .update(updates)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('outreach_settings')
          .insert({ user_id: user.id, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach-settings'] });
      toast({ title: 'Outreach settings saved' });
    },
    onError: (error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    },
  });

  return { settings, isLoading, upsert: upsert.mutateAsync, isSaving: upsert.isPending };
}
