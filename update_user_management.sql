-- Run this SQL to fix User Management
-- This adds the function to fetch all users for admins

-- Drop the function if it exists (to allow re-running)
DROP FUNCTION IF EXISTS public.get_all_users_with_roles();

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
