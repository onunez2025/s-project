-- Establish the project-assets bucket if it does not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow public read access (Anyone can download a file)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'project-assets' );

-- Policy 2: Allow authenticated and anon inserts (Anyone can upload a file)
CREATE POLICY "Public Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'project-assets' );

-- Policy 3: Allow authenticated and anon updates (Updating a file)
CREATE POLICY "Public Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'project-assets' );

-- Policy 4: Allow authenticated and anon deletes (Deleting a file)
CREATE POLICY "Public Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'project-assets' );
