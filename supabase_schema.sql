-- BRRA Portal Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles table

-- Policy: Users can view their own role
CREATE POLICY "Users can view own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles"
    ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert roles
CREATE POLICY "Admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update roles
CREATE POLICY "Admins can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete roles
CREATE POLICY "Admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to automatically create user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert first admin user (REPLACE with your actual user email)
-- After running this, log in with this email to get the user_id, then update this query
-- Example: INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-uuid-here', 'admin');

-- To find your user_id after signing up, run:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the admin role:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('paste-your-user-id-here', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime for user_roles table (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

-- Create a function to get all users with roles (for admins only)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    full_name TEXT,
    agency_name TEXT,
    phone TEXT,
    role TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND user_roles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Return all users with their roles
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        (u.raw_user_meta_data->>'full_name')::TEXT,
        (u.raw_user_meta_data->>'agency_name')::TEXT,
        (u.raw_user_meta_data->>'phone')::TEXT,
        COALESCE(ur.role, 'user')::TEXT
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (function checks admin internally)
GRANT EXECUTE ON FUNCTION public.get_all_users_with_roles() TO authenticated;
