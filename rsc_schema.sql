-- Regulatory Services Centres (RSC) Schema
-- Run this SQL in your Supabase SQL Editor

-- Create rsc_centres table
CREATE TABLE IF NOT EXISTS public.rsc_centres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rsc_gallery table for multiple images per RSC
CREATE TABLE IF NOT EXISTS public.rsc_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rsc_id UUID NOT NULL REFERENCES public.rsc_centres(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rsc_centres_active ON public.rsc_centres(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_rsc_centres_location ON public.rsc_centres(location);
CREATE INDEX IF NOT EXISTS idx_rsc_gallery_rsc_id ON public.rsc_gallery(rsc_id, display_order);

-- Enable Row Level Security
ALTER TABLE public.rsc_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsc_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active RSCs" ON public.rsc_centres;
DROP POLICY IF EXISTS "Admins can view all RSCs" ON public.rsc_centres;
DROP POLICY IF EXISTS "Admins can create RSCs" ON public.rsc_centres;
DROP POLICY IF EXISTS "Admins can update RSCs" ON public.rsc_centres;
DROP POLICY IF EXISTS "Admins can delete RSCs" ON public.rsc_centres;

DROP POLICY IF EXISTS "Anyone can view RSC gallery" ON public.rsc_gallery;
DROP POLICY IF EXISTS "Admins can manage RSC gallery" ON public.rsc_gallery;

-- RLS Policies for rsc_centres table

-- Policy: Anyone can view active RSCs
CREATE POLICY "Anyone can view active RSCs"
    ON public.rsc_centres
    FOR SELECT
    USING (is_active = TRUE);

-- Policy: Admins can view all RSCs
CREATE POLICY "Admins can view all RSCs"
    ON public.rsc_centres
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create RSCs
CREATE POLICY "Admins can create RSCs"
    ON public.rsc_centres
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update RSCs
CREATE POLICY "Admins can update RSCs"
    ON public.rsc_centres
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete RSCs
CREATE POLICY "Admins can delete RSCs"
    ON public.rsc_centres
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for rsc_gallery table

-- Policy: Anyone can view RSC gallery images
CREATE POLICY "Anyone can view RSC gallery"
    ON public.rsc_gallery
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rsc_centres
            WHERE id = rsc_gallery.rsc_id AND is_active = TRUE
        )
    );

-- Policy: Admins can manage RSC gallery
CREATE POLICY "Admins can manage RSC gallery"
    ON public.rsc_gallery
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_rsc_centres_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_rsc_centres_updated_at ON public.rsc_centres;
CREATE TRIGGER update_rsc_centres_updated_at
    BEFORE UPDATE ON public.rsc_centres
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rsc_centres_updated_at();

-- Function to get RSC with gallery images
CREATE OR REPLACE FUNCTION public.get_rsc_with_gallery(p_rsc_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'rsc', row_to_json(r.*),
        'gallery', COALESCE(
            (SELECT json_agg(row_to_json(g.*) ORDER BY g.display_order)
             FROM public.rsc_gallery g
             WHERE g.rsc_id = p_rsc_id),
            '[]'::json
        )
    )
    INTO result
    FROM public.rsc_centres r
    WHERE r.id = p_rsc_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.rsc_centres TO authenticated;
GRANT ALL ON public.rsc_centres TO authenticated;
GRANT SELECT ON public.rsc_gallery TO authenticated;
GRANT ALL ON public.rsc_gallery TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rsc_with_gallery TO authenticated;

-- Insert default RSC data
INSERT INTO public.rsc_centres (name, location, address, email, phone, description, display_order) VALUES
('Livingstone RSC', 'Livingstone', 'Livingstone Town Centre', 'livingstone@brra.org.zm', '+260 213 320123', 'Regulatory Services Centre in Livingstone', 1),
('Lusaka RSC', 'Lusaka', 'Lusaka City Centre', 'lusaka@brra.org.zm', '+260 211 259165', 'Regulatory Services Centre in Lusaka', 2),
('Kitwe RSC', 'Kitwe', 'Kitwe Business District', 'kitwe@brra.org.zm', '+260 212 220456', 'Regulatory Services Centre in Kitwe', 3),
('Chipata RSC', 'Chipata', 'Chipata Town', 'chipata@brra.org.zm', '+260 216 221789', 'Regulatory Services Centre in Chipata', 4),
('Kabwe RSC', 'Kabwe', 'Kabwe Central', 'kabwe@brra.org.zm', '+260 215 222345', 'Regulatory Services Centre in Kabwe', 5),
('Solwezi RSC', 'Solwezi', 'Solwezi Town', 'solwezi@brra.org.zm', '+260 218 821456', 'Regulatory Services Centre in Solwezi', 6),
('Chinsali RSC', 'Chinsali', 'Chinsali District', 'chinsali@brra.org.zm', '+260 214 370123', 'Regulatory Services Centre in Chinsali', 7),
('Kasama RSC', 'Kasama', 'Kasama Town', 'kasama@brra.org.zm', '+260 214 221890', 'Regulatory Services Centre in Kasama', 8)
ON CONFLICT DO NOTHING;
