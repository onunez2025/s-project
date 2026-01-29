-- Create table for storing manual images as base64 or URLs
CREATE TABLE IF NOT EXISTS public.app_manual_assets (
    id SERIAL PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL, -- e.g. 'PROJECT', 'KANBAN'
    image_url TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for this table
ALTER TABLE public.app_manual_assets REPLICA IDENTITY FULL;

-- Helper to track updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manual_assets_modtime
    BEFORE UPDATE ON public.app_manual_assets
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Initial data (optional defaults)
INSERT INTO public.app_manual_assets (section_key, image_url) VALUES 
('PROJECT', 'assets/manual/projects.png'),
('KANBAN', 'assets/manual/kanban.png')
ON CONFLICT (section_key) DO NOTHING;

-- Grant permissions (if needed)
GRANT ALL ON public.app_manual_assets TO postgres;
GRANT ALL ON public.app_manual_assets TO anon;
GRANT ALL ON public.app_manual_assets TO authenticated;
GRANT ALL ON public.app_manual_assets TO service_role;
