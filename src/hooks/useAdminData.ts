import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminKPIs {
  totalUsers: number;
  totalPitches: number;
  pitchesByStatus: { draft: number; sent: number; feedback_received: number };
  totalViews: number;
  viewsLast7Days: number;
  totalLeads: number;
  totalEmailsSent: number;
  totalFeedback: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  pitchCount: number;
  leadCount: number;
  emailCount: number;
}

export interface AdminPitch {
  id: string;
  client_name: string;
  owner_email: string;
  status: string;
  views: number;
  created_at: string;
  slug: string;
}

export interface AdminActivity {
  type: 'visit' | 'feedback' | 'email';
  timestamp: string;
  preview_id?: string;
  device?: string;
  country?: string;
  client_name?: string;
  recipient?: string;
  subject?: string;
}

export interface AdminEmailHealth {
  email: string;
  provider: string;
  warmy_state: string | null;
  temperature: number | null;
  deliverability: number | null;
  dns_score: number | null;
  daily_limit: number | null;
  sent_today: number | null;
  is_active: boolean;
}

export interface AdminData {
  kpis: AdminKPIs;
  usersTable: AdminUser[];
  pitchesTable: AdminPitch[];
  activity: AdminActivity[];
  emailHealth: AdminEmailHealth[];
}

export function useAdminData() {
  return useQuery<AdminData>({
    queryKey: ['admin-data'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-data');
      if (error) throw new Error(error.message);
      return data as AdminData;
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
