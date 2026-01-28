-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'pitched', 'converted');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  category TEXT,
  rating DECIMAL(2,1),
  source_query TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'new',
  preview_id UUID REFERENCES public.client_previews(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can only access their own leads
CREATE POLICY "Users can view their own leads"
ON public.leads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads"
ON public.leads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
ON public.leads
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
ON public.leads
FOR DELETE
USING (auth.uid() = user_id);

-- Create outreach_emails table for Phase 2
CREATE TYPE public.email_status AS ENUM ('sent', 'opened', 'clicked', 'bounced');

CREATE TABLE public.outreach_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preview_id UUID REFERENCES public.client_previews(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status email_status NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.outreach_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own outreach emails"
ON public.outreach_emails
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outreach emails"
ON public.outreach_emails
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outreach emails"
ON public.outreach_emails
FOR UPDATE
USING (auth.uid() = user_id);