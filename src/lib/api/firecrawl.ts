import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: (
    | 'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'branding' | 'summary'
  )[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

export const firecrawlApi = {
  // Scrape a single URL with branding info
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    try {
      // Use fetch directly with longer timeout for scraping operations
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`${supabaseUrl}/functions/v1/firecrawl-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ url, options }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Scraping failed' };
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. The website took too long to scrape.' };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Failed to scrape' };
    }
  },
};
