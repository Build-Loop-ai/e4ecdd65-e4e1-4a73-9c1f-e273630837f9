
-- Table to capture email leads from the demo page
CREATE TABLE public.demo_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  url_submitted TEXT NOT NULL,
  preview_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit their email (public lead magnet)
CREATE POLICY "Anyone can insert demo leads"
  ON public.demo_leads
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view demo leads
CREATE POLICY "Admins can view demo leads"
  ON public.demo_leads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
