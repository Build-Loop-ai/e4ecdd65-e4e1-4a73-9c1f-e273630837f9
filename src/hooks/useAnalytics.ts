import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export type DateRange = '7d' | '14d' | '30d';

interface VisitData {
  id: string;
  preview_id: string;
  visited_at: string;
  session_duration: number | null;
  device_type: string;
  country: string | null;
  city: string | null;
  referrer: string | null;
}

interface PreviewInfo {
  id: string;
  client_name: string;
  slug: string;
}

interface DailyStats {
  date: string;
  views: number;
}

interface DeviceStats {
  device_type: string;
  count: number;
}

interface TopPreview {
  preview_id: string;
  client_name: string;
  views: number;
}

export function useAnalytics(dateRange: DateRange = '7d') {
  const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
  const startDate = startOfDay(subDays(new Date(), days));

  // Fetch all visits for user's previews
  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ['analytics-visits', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preview_visits')
        .select('*')
        .gte('visited_at', startDate.toISOString())
        .order('visited_at', { ascending: false });
      
      if (error) throw error;
      return data as VisitData[];
    },
  });

  // Fetch user's previews for mapping
  const { data: previews, isLoading: previewsLoading } = useQuery({
    queryKey: ['analytics-previews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_previews')
        .select('id, client_name, slug');
      
      if (error) throw error;
      return data as PreviewInfo[];
    },
  });

  // Calculate daily stats
  const dailyStats: DailyStats[] = [];
  if (visits) {
    const dailyMap = new Map<string, number>();
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      dailyMap.set(date, 0);
    }
    
    // Count visits per day
    visits.forEach(visit => {
      const date = format(new Date(visit.visited_at), 'yyyy-MM-dd');
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    
    dailyMap.forEach((views, date) => {
      dailyStats.push({ date, views });
    });
  }

  // Calculate device stats
  const deviceStats: DeviceStats[] = [];
  if (visits) {
    const deviceMap = new Map<string, number>();
    visits.forEach(visit => {
      deviceMap.set(visit.device_type, (deviceMap.get(visit.device_type) || 0) + 1);
    });
    deviceMap.forEach((count, device_type) => {
      deviceStats.push({ device_type, count });
    });
  }

  // Calculate top previews
  const topPreviews: TopPreview[] = [];
  if (visits && previews) {
    const previewMap = new Map<string, number>();
    visits.forEach(visit => {
      previewMap.set(visit.preview_id, (previewMap.get(visit.preview_id) || 0) + 1);
    });
    
    const previewNameMap = new Map(previews.map(p => [p.id, p.client_name]));
    
    previewMap.forEach((views, preview_id) => {
      topPreviews.push({
        preview_id,
        client_name: previewNameMap.get(preview_id) || 'Unknown',
        views,
      });
    });
    
    topPreviews.sort((a, b) => b.views - a.views);
  }

  // Get unique visitors (by ip_hash)
  const uniqueVisitors = visits 
    ? new Set(visits.map(v => v.id)).size // Using visit ID as proxy since ip_hash isn't returned
    : 0;

  // Calculate average session duration (for visits with duration)
  const avgSessionDuration = visits
    ? visits.filter(v => v.session_duration).reduce((acc, v) => acc + (v.session_duration || 0), 0) / 
      (visits.filter(v => v.session_duration).length || 1)
    : 0;

  // Recent visits (last 10)
  const recentVisits = visits?.slice(0, 10).map(visit => ({
    ...visit,
    client_name: previews?.find(p => p.id === visit.preview_id)?.client_name || 'Unknown',
  })) || [];

  return {
    totalViews: visits?.length || 0,
    uniqueVisitors,
    avgSessionDuration: Math.round(avgSessionDuration),
    dailyStats,
    deviceStats,
    topPreviews: topPreviews.slice(0, 5),
    recentVisits,
    isLoading: visitsLoading || previewsLoading,
  };
}

// Hook for dashboard overview stats
export function useDashboardStats() {
  const { data: previews, isLoading: previewsLoading } = useQuery({
    queryKey: ['dashboard-previews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_previews')
        .select('id, status');
      if (error) throw error;
      return data;
    },
  });

  const { data: totalViews, isLoading: viewsLoading } = useQuery({
    queryKey: ['dashboard-total-views'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('preview_visits')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: weekViews, isLoading: weekViewsLoading } = useQuery({
    queryKey: ['dashboard-week-views'],
    queryFn: async () => {
      const weekAgo = subDays(new Date(), 7).toISOString();
      const { count, error } = await supabase
        .from('preview_visits')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', weekAgo);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: unreadFeedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['dashboard-unread-feedback'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('client_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    },
  });

  return {
    totalPreviews: previews?.length || 0,
    activePreviews: previews?.filter(p => p.status === 'sent').length || 0,
    totalViews: totalViews || 0,
    weekViews: weekViews || 0,
    unreadFeedback: unreadFeedback || 0,
    isLoading: previewsLoading || viewsLoading || weekViewsLoading || feedbackLoading,
  };
}
