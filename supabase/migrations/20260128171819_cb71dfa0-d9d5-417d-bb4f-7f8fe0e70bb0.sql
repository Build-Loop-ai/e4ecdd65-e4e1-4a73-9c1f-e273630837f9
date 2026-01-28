-- Storage bucket for AI-generated preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Policy: Allow public reads
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

-- Policy: Allow service role writes (edge functions)
CREATE POLICY "Service role write access for generated images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images');

-- Policy: Allow service role updates
CREATE POLICY "Service role update access for generated images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'generated-images');

-- Policy: Allow service role deletes
CREATE POLICY "Service role delete access for generated images"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images');