import { supabase } from '@/integrations/supabase/client';

export interface ApifyLead {
  business_name: string;
  website_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  category: string | null;
  rating: number | null;
  google_maps_url: string | null;
}

export interface SearchLeadsResponse {
  success: boolean;
  data?: ApifyLead[];
  error?: string;
}

export async function searchLeads(query: string, maxResults = 20): Promise<SearchLeadsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('apify-google-maps', {
      body: { query, maxResults },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return data as SearchLeadsResponse;
  } catch (err) {
    console.error('API call error:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to search leads' 
    };
  }
}
