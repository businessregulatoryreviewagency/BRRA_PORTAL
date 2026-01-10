-- Information Resources Schema (Publications, Annual Reports, Downloads)
-- Run this SQL in your Supabase SQL Editor

-- Create information_resources table
CREATE TABLE IF NOT EXISTS public.information_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('publication', 'annual_report', 'download')),
    pdf_url TEXT NOT NULL,
    file_size BIGINT,
    published_date DATE,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_info_resources_type ON public.information_resources(resource_type, display_order);
CREATE INDEX IF NOT EXISTS idx_info_resources_published ON public.information_resources(is_published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_info_resources_created ON public.information_resources(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.information_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.information_resources;
DROP POLICY IF EXISTS "Admins can view all resources" ON public.information_resources;
DROP POLICY IF EXISTS "Admins can create resources" ON public.information_resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.information_resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.information_resources;

-- RLS Policies for information_resources table

-- Policy: Anyone can view published resources
CREATE POLICY "Anyone can view published resources"
    ON public.information_resources
    FOR SELECT
    USING (is_published = TRUE);

-- Policy: Admins can view all resources
CREATE POLICY "Admins can view all resources"
    ON public.information_resources
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create resources
CREATE POLICY "Admins can create resources"
    ON public.information_resources
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update resources
CREATE POLICY "Admins can update resources"
    ON public.information_resources
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete resources
CREATE POLICY "Admins can delete resources"
    ON public.information_resources
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_information_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_information_resources_updated_at ON public.information_resources;
CREATE TRIGGER update_information_resources_updated_at
    BEFORE UPDATE ON public.information_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_information_resources_updated_at();

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.information_resources
    SET download_count = download_count + 1
    WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get resources by type
CREATE OR REPLACE FUNCTION public.get_resources_by_type(p_resource_type VARCHAR)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    resource_type VARCHAR,
    pdf_url TEXT,
    file_size BIGINT,
    published_date DATE,
    display_order INTEGER,
    download_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.resource_type,
        r.pdf_url,
        r.file_size,
        r.published_date,
        r.display_order,
        r.download_count,
        r.created_at
    FROM public.information_resources r
    WHERE r.resource_type = p_resource_type
        AND r.is_published = TRUE
    ORDER BY r.display_order ASC, r.published_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.information_resources TO authenticated;
GRANT ALL ON public.information_resources TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_download_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_resources_by_type TO authenticated;
