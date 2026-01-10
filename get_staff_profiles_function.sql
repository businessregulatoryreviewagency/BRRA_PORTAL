-- Function to get all staff profiles with user emails for admin
-- Run this SQL in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_staff_profiles_with_emails()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    full_name VARCHAR,
    nrc VARCHAR,
    file_number VARCHAR,
    contact_phone VARCHAR,
    contact_email VARCHAR,
    position_id UUID,
    department_id UUID,
    grade_id UUID,
    date_joined DATE,
    employment_status VARCHAR,
    address TEXT,
    emergency_contact_name VARCHAR,
    emergency_contact_phone VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    email VARCHAR,
    position_title VARCHAR,
    department_name VARCHAR,
    grade_number INTEGER,
    grade_name VARCHAR
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
        sp.id,
        sp.user_id,
        sp.full_name,
        sp.nrc,
        sp.file_number,
        sp.contact_phone,
        sp.contact_email,
        sp.position_id,
        sp.department_id,
        sp.grade_id,
        sp.date_joined,
        sp.employment_status,
        sp.address,
        sp.emergency_contact_name,
        sp.emergency_contact_phone,
        sp.created_at,
        sp.updated_at,
        COALESCE(au.email, sp.contact_email, 'N/A') as email,
        p.title as position_title,
        d.name as department_name,
        g.grade_number,
        g.grade_name
    FROM public.staff_profiles sp
    LEFT JOIN auth.users au ON au.id = sp.user_id
    LEFT JOIN public.positions p ON p.id = sp.position_id
    LEFT JOIN public.departments d ON d.id = sp.department_id
    LEFT JOIN public.grades g ON g.id = sp.grade_id
    ORDER BY sp.full_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_profiles_with_emails() TO authenticated;
