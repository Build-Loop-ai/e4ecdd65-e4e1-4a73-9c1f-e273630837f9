
-- Create outreach_settings table
CREATE TABLE public.outreach_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  auto_send_enabled boolean NOT NULL DEFAULT false,
  daily_cap integer NOT NULL DEFAULT 20,
  send_window_start integer NOT NULL DEFAULT 9,
  send_window_end integer NOT NULL DEFAULT 17,
  followup_enabled boolean NOT NULL DEFAULT true,
  tone text NOT NULL DEFAULT 'professional',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view their own outreach settings"
ON public.outreach_settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert their own outreach settings"
ON public.outreach_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update their own outreach settings"
ON public.outreach_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_outreach_settings_updated_at
BEFORE UPDATE ON public.outreach_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
