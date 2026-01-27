-- Create preview_visits table for tracking website visits
CREATE TABLE public.preview_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_id UUID NOT NULL REFERENCES public.client_previews(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_duration INTEGER, -- seconds, nullable until session ends
  device_type TEXT NOT NULL DEFAULT 'desktop',
  country TEXT,
  city TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT -- hashed for privacy
);

-- Create index for faster queries
CREATE INDEX idx_preview_visits_preview_id ON public.preview_visits(preview_id);
CREATE INDEX idx_preview_visits_visited_at ON public.preview_visits(visited_at DESC);

-- Enable RLS
ALTER TABLE public.preview_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert visits (public tracking)
CREATE POLICY "Anyone can insert visits"
ON public.preview_visits
FOR INSERT
WITH CHECK (true);

-- Preview owners can view their own visits
CREATE POLICY "Preview owners can view visits"
ON public.preview_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_previews
    WHERE client_previews.id = preview_visits.preview_id
    AND client_previews.user_id = auth.uid()
  )
);