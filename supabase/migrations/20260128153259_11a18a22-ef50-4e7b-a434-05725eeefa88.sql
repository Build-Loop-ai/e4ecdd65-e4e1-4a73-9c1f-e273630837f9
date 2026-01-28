-- Allow anyone to view profiles (needed for creator footer on public pitch pages)
CREATE POLICY "Anyone can view profiles for public display"
ON public.profiles
FOR SELECT
USING (true);