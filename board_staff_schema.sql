-- Board Members and Staff Management Schema
-- Run this SQL in your Supabase SQL Editor

-- Create board_members table
CREATE TABLE IF NOT EXISTS public.board_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    position_level INTEGER NOT NULL CHECK (position_level IN (1, 2, 3)),
    -- 1 = Board Chair, 2 = Vice Chair, 3 = Board Member
    image_url TEXT,
    bio TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    position_level INTEGER NOT NULL CHECK (position_level IN (1, 2, 3)),
    -- 1 = Executive Director, 2 = Director, 3 = Manager
    image_url TEXT,
    bio TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_board_members_position ON public.board_members(position_level, display_order);
CREATE INDEX IF NOT EXISTS idx_board_members_active ON public.board_members(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_members_position ON public.staff_members(position_level, display_order);
CREATE INDEX IF NOT EXISTS idx_staff_members_active ON public.staff_members(is_active);

-- Enable Row Level Security
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active board members" ON public.board_members;
DROP POLICY IF EXISTS "Admins can view all board members" ON public.board_members;
DROP POLICY IF EXISTS "Admins can create board members" ON public.board_members;
DROP POLICY IF EXISTS "Admins can update board members" ON public.board_members;
DROP POLICY IF EXISTS "Admins can delete board members" ON public.board_members;

DROP POLICY IF EXISTS "Anyone can view active staff members" ON public.staff_members;
DROP POLICY IF EXISTS "Admins can view all staff members" ON public.staff_members;
DROP POLICY IF EXISTS "Admins can create staff members" ON public.staff_members;
DROP POLICY IF EXISTS "Admins can update staff members" ON public.staff_members;
DROP POLICY IF EXISTS "Admins can delete staff members" ON public.staff_members;

-- RLS Policies for board_members table

-- Policy: Anyone can view active board members
CREATE POLICY "Anyone can view active board members"
    ON public.board_members
    FOR SELECT
    USING (is_active = TRUE);

-- Policy: Admins can view all board members
CREATE POLICY "Admins can view all board members"
    ON public.board_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create board members
CREATE POLICY "Admins can create board members"
    ON public.board_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update board members
CREATE POLICY "Admins can update board members"
    ON public.board_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete board members
CREATE POLICY "Admins can delete board members"
    ON public.board_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for staff_members table

-- Policy: Anyone can view active staff members
CREATE POLICY "Anyone can view active staff members"
    ON public.staff_members
    FOR SELECT
    USING (is_active = TRUE);

-- Policy: Admins can view all staff members
CREATE POLICY "Admins can view all staff members"
    ON public.staff_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can create staff members
CREATE POLICY "Admins can create staff members"
    ON public.staff_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update staff members
CREATE POLICY "Admins can update staff members"
    ON public.staff_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete staff members
CREATE POLICY "Admins can delete staff members"
    ON public.staff_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp for board_members
CREATE OR REPLACE FUNCTION public.update_board_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp for staff_members
CREATE OR REPLACE FUNCTION public.update_staff_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for board_members
DROP TRIGGER IF EXISTS update_board_members_updated_at ON public.board_members;
CREATE TRIGGER update_board_members_updated_at
    BEFORE UPDATE ON public.board_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_board_members_updated_at();

-- Trigger to automatically update updated_at for staff_members
DROP TRIGGER IF EXISTS update_staff_members_updated_at ON public.staff_members;
CREATE TRIGGER update_staff_members_updated_at
    BEFORE UPDATE ON public.staff_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_staff_members_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.board_members TO authenticated;
GRANT ALL ON public.board_members TO authenticated;
GRANT SELECT ON public.staff_members TO authenticated;
GRANT ALL ON public.staff_members TO authenticated;
