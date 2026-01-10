-- Function to get all users without staff profiles for admin
-- Run this SQL in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    role VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        au.id,
        au.email::VARCHAR,
        COALESCE(ur.role, 'user')::VARCHAR as role,
        au.created_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON ur.user_id = au.id
    LEFT JOIN public.staff_profiles sp ON sp.user_id = au.id
    WHERE sp.id IS NULL  -- Only users without staff profiles
    ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
