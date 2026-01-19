-- News Schema Update: Add PDF Upload Fields
-- Run this SQL in your Supabase SQL Editor to add PDF support to existing news table

-- Add PDF columns to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT;

-- Update category constraint to include newsletter
ALTER TABLE public.news 
DROP CONSTRAINT IF EXISTS news_category_check;

ALTER TABLE public.news 
ADD CONSTRAINT news_category_check 
CHECK (category IN ('general', 'newsletter', 'announcement', 'event'));

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
