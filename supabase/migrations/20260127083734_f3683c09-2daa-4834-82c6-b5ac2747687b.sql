-- Create preview status enum
CREATE TYPE public.preview_status AS ENUM ('draft', 'sent', 'feedback_received');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create client_previews table (main table for scraped sites)
CREATE TABLE public.client_previews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  original_url TEXT NOT NULL,
  status preview_status NOT NULL DEFAULT 'draft',
  template_id TEXT NOT NULL DEFAULT 'corporate-classic',
  
  -- Scraped content stored as structured JSON
  scraped_content JSONB,
  -- AI-processed schema
  processed_schema JSONB,
  -- Extracted brand colors
  brand_colors JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_previews
ALTER TABLE public.client_previews ENABLE ROW LEVEL SECURITY;

-- Client previews policies for owners
CREATE POLICY "Users can view their own previews"
  ON public.client_previews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own previews"
  ON public.client_previews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own previews"
  ON public.client_previews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own previews"
  ON public.client_previews FOR DELETE
  USING (auth.uid() = user_id);

-- Public access policy for viewing previews via slug (for clients)
CREATE POLICY "Anyone can view previews by slug"
  ON public.client_previews FOR SELECT
  USING (true);

-- Create client_feedback table
CREATE TABLE public.client_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preview_id UUID REFERENCES public.client_previews(id) ON DELETE CASCADE NOT NULL,
  client_email TEXT,
  client_name TEXT,
  feedback_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_feedback
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback (clients don't need to auth)
CREATE POLICY "Anyone can submit feedback"
  ON public.client_feedback FOR INSERT
  WITH CHECK (true);

-- Preview owners can view feedback
CREATE POLICY "Preview owners can view feedback"
  ON public.client_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_previews
      WHERE client_previews.id = client_feedback.preview_id
      AND client_previews.user_id = auth.uid()
    )
  );

-- Preview owners can update feedback (mark as read)
CREATE POLICY "Preview owners can update feedback"
  ON public.client_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.client_previews
      WHERE client_previews.id = client_feedback.preview_id
      AND client_previews.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_previews_updated_at
  BEFORE UPDATE ON public.client_previews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();