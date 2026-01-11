-- News Management Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    image_url TEXT,
    pdf_url TEXT,
    pdf_file_size BIGINT,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(255),
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'newsletter', 'announcement', 'event')),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_author ON public.news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Admins can view all news" ON public.news;
DROP POLICY IF EXISTS "Admins can create news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;

-- RLS Policies for news table

-- Policy: Anyone (authenticated) can view published news
CREATE POLICY "Anyone can view published news"
    ON public.news
    FOR SELECT
    USING (is_published = TRUE);

-- Policy: Admins can view all news (including drafts)
CREATE POLICY "Admins can view all news"
    ON public.news
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create news
CREATE POLICY "Admins can create news"
    ON public.news
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update news
CREATE POLICY "Admins can update news"
    ON public.news
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete news
CREATE POLICY "Admins can delete news"
    ON public.news
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_news_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.news TO authenticated;
GRANT ALL ON public.news TO authenticated;

-- Function to get published news with pagination
CREATE OR REPLACE FUNCTION public.get_published_news(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    content TEXT,
    summary TEXT,
    image_url TEXT,
    author_name VARCHAR,
    category VARCHAR,
    is_featured BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.content,
        n.summary,
        n.image_url,
        n.author_name,
        n.category,
        n.is_featured,
        n.published_at,
        n.created_at
    FROM public.news n
    WHERE n.is_published = TRUE
        AND (p_category IS NULL OR n.category = p_category)
    ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_published_news(INTEGER, INTEGER, VARCHAR) TO authenticated;

-- Function to get featured news for home page
CREATE OR REPLACE FUNCTION public.get_featured_news(p_limit INTEGER DEFAULT 3)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    content TEXT,
    summary TEXT,
    image_url TEXT,
    author_name VARCHAR,
    category VARCHAR,
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.content,
        n.summary,
        n.image_url,
        n.author_name,
        n.category,
        n.published_at
    FROM public.news n
    WHERE n.is_published = TRUE AND n.is_featured = TRUE
    ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_featured_news(INTEGER) TO authenticated;
