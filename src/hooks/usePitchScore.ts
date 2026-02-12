import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PitchScoreDimension {
  name: string;
  score: number;
  tips: string[];
}

export interface PitchScore {
  overall_score: number;
  summary: string;
  dimensions: PitchScoreDimension[];
  top_improvement: string;
}

export function usePitchScore() {
  const [score, setScore] = useState<PitchScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const scorePitch = async (previewId: string) => {
    setIsLoading(true);
    setScore(null);

    try {
      const { data, error } = await supabase.functions.invoke('score-pitch', {
        body: { previewId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setScore(data as PitchScore);
    } catch (e: any) {
      toast({
        title: 'Scoring failed',
        description: e.message || 'Could not score this pitch.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { score, isLoading, scorePitch };
}
