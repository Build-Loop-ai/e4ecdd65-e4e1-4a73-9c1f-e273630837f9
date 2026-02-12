import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ApifyLead } from '@/lib/api/apify';
import type { Tables } from '@/integrations/supabase/types';

export type SavedLead = Tables<'leads'>;

export interface LeadFilters {
  status?: 'new' | 'pitched' | 'converted' | null;
  city?: string | null;
  category?: string | null;
}

export interface LeadSort {
  field: 'created_at' | 'rating' | 'business_name';
  direction: 'asc' | 'desc';
}

export function useLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<LeadFilters>({});
  const [sort, setSort] = useState<LeadSort>({ field: 'created_at', direction: 'desc' });

  // Fetch all saved leads with filters
  const { data: savedLeads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads', user?.id, filters, sort],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SavedLead[];
    },
    enabled: !!user?.id,
  });

  // Get unique cities and categories for filter dropdowns
  const filterOptions = useQuery({
    queryKey: ['leads-filter-options', user?.id],
    queryFn: async () => {
      if (!user?.id) return { cities: [], categories: [] };
      
      const { data } = await supabase
        .from('leads')
        .select('city, category')
        .eq('user_id', user.id);
      
      const cities = [...new Set(data?.map(l => l.city).filter(Boolean) as string[])];
      const categories = [...new Set(data?.map(l => l.category).filter(Boolean) as string[])];
      
      return { cities, categories };
    },
    enabled: !!user?.id,
  });

  // Check which URLs are already saved
  const checkExistingLeads = async (urls: string[]): Promise<Set<string>> => {
    if (!user?.id || urls.length === 0) return new Set();
    
    const validUrls = urls.filter(Boolean);
    if (validUrls.length === 0) return new Set();
    
    const { data } = await supabase
      .from('leads')
      .select('website_url')
      .eq('user_id', user.id)
      .in('website_url', validUrls);
    
    return new Set(data?.map(d => d.website_url).filter(Boolean) as string[]);
  };

  // Save a single lead
  const saveLead = useMutation({
    mutationFn: async ({ lead, sourceQuery }: { lead: ApifyLead; sourceQuery: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          business_name: lead.business_name,
          website_url: lead.website_url,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          category: lead.category,
          rating: lead.rating,
          source_query: sourceQuery,
          status: 'new',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-filter-options'] });
      toast({ title: 'Lead saved!' });
      // Trigger auto-outreach in background (fire and forget)
      if (data?.id) {
        supabase.functions.invoke('auto-outreach', {
          body: { leadIds: [data.id], mode: 'auto' },
        }).catch(() => {}); // silent — auto-outreach is best-effort
      }
    },
    onError: (error) => {
      toast({ title: 'Failed to save lead', description: error.message, variant: 'destructive' });
    },
  });

  // Save multiple leads
  const saveAllLeads = useMutation({
    mutationFn: async ({ leads, sourceQuery, existingUrls }: { 
      leads: ApifyLead[]; 
      sourceQuery: string; 
      existingUrls: Set<string>;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const newLeads = leads.filter(
        lead => lead.website_url && !existingUrls.has(lead.website_url)
      );
      
      if (newLeads.length === 0) {
        return { saved: 0, skipped: leads.length };
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert(newLeads.map(lead => ({
          user_id: user.id,
          business_name: lead.business_name,
          website_url: lead.website_url,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          category: lead.category,
          rating: lead.rating,
          source_query: sourceQuery,
          status: 'new' as const,
        })))
        .select();
      
      if (error) throw error;
      return { saved: data?.length || 0, skipped: leads.length - newLeads.length, data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-filter-options'] });
      if (result.saved > 0) {
        toast({ title: `Saved ${result.saved} new leads${result.skipped > 0 ? ` (${result.skipped} already saved)` : ''}` });
      } else {
        toast({ title: 'All leads already saved' });
      }
    },
    onError: (error) => {
      toast({ title: 'Failed to save leads', description: error.message, variant: 'destructive' });
    },
  });

  // Delete leads
  const deleteLeads = useMutation({
    mutationFn: async (leadIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('user_id', user.id)
        .in('id', leadIds);
      
      if (error) throw error;
      return leadIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-filter-options'] });
      toast({ title: `Deleted ${count} lead${count !== 1 ? 's' : ''}` });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete leads', description: error.message, variant: 'destructive' });
    },
  });

  // Update lead status
  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: 'new' | 'pitched' | 'converted' }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    // Data
    savedLeads,
    isLoading,
    filterOptions: filterOptions.data || { cities: [], categories: [] },
    
    // Filters & Sorting
    filters,
    setFilters,
    sort,
    setSort,
    
    // Actions
    checkExistingLeads,
    saveLead: saveLead.mutateAsync,
    saveAllLeads: saveAllLeads.mutateAsync,
    deleteLeads: deleteLeads.mutateAsync,
    updateLeadStatus: updateLeadStatus.mutateAsync,
    refetch,
    
    // Loading states
    isSaving: saveLead.isPending || saveAllLeads.isPending,
    isDeleting: deleteLeads.isPending,
  };
}
