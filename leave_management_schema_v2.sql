-- Leave Management Database Schema V2
-- Supports 3 leave categories with different approval tiers
-- Run this SQL in your Supabase SQL Editor

-- Drop existing table if needed (be careful in production!)
-- DROP TABLE IF EXISTS public.leave_requests CASCADE;

-- Create holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, day)
);

-- Insert Zambian public holidays (year-agnostic)
INSERT INTO public.holidays (name, month, day) VALUES
    ('New Year''s Day', 1, 1),
    ('International Women''s Day', 3, 8),
    ('Youth Day', 3, 12),
    ('Kenneth Kaunda Birthday', 4, 28),
    ('Labour Day', 5, 1),
    ('Africa Day', 5, 26),
    ('Heroes Day', 7, 7),
    ('Unity Day', 7, 8),
    ('Zambia Farmers Day', 8, 4),
    ('National Day of Prayer', 10, 18),
    ('Independence Day', 10, 24),
    ('Christmas Day', 12, 25)
ON CONFLICT (month, day) DO NOTHING;

-- Note: Good Friday, Holy Saturday, and Easter Monday are movable holidays
-- They will need to be calculated based on Easter date each year

-- Create leave_categories table
CREATE TABLE IF NOT EXISTS public.leave_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    approval_tiers INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_types table
CREATE TABLE IF NOT EXISTS public.leave_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES public.leave_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_days_per_year INTEGER,
    requires_documentation BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert leave categories
INSERT INTO public.leave_categories (name, description, approval_tiers) VALUES
    ('annual_leave', 'Annual Leave - 3-tier approval (Supervisor → HR → ED)', 3),
    ('local_leave', 'Local/Casual Leave - 2-tier approval (Supervisor → HR)', 2),
    ('claim_annual_days', 'Claim Annual Leave Days - 1-tier approval (Supervisor only)', 1)
ON CONFLICT (name) DO NOTHING;

-- Insert leave types for Local Leave category
INSERT INTO public.leave_types (category_id, name, description, max_days_per_year) 
SELECT 
    c.id,
    t.name,
    t.description,
    t.max_days
FROM public.leave_categories c
CROSS JOIN (
    VALUES 
        ('Annual Leave', 'Regular annual leave days', 30),
        ('Local Leave', 'Short local leave', 10),
        ('Sick Leave', 'Leave due to illness', 30),
        ('Unpaid Leave', 'Leave without pay', NULL),
        ('Mothers Day', 'Special leave for mothers', 1),
        ('Study Leave', 'Leave for educational purposes', 30),
        ('Compassionate Leave', 'Leave for family emergencies', 5),
        ('Maternity Leave', 'Leave for new mothers', 90),
        ('Paternity Leave', 'Leave for new fathers', 14),
        ('Forced Leave', 'Mandatory leave', NULL)
) AS t(name, description, max_days)
WHERE c.name = 'local_leave'
ON CONFLICT DO NOTHING;

-- Alter leave_requests table to support new structure and form fields
ALTER TABLE public.leave_requests 
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.leave_categories(id),
    ADD COLUMN IF NOT EXISTS leave_type_id UUID REFERENCES public.leave_types(id),
    ADD COLUMN IF NOT EXISTS approval_tier_1_status VARCHAR(20) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS approval_tier_1_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS approval_tier_1_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approval_tier_1_notes TEXT,
    ADD COLUMN IF NOT EXISTS approval_tier_2_status VARCHAR(20) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS approval_tier_2_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS approval_tier_2_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approval_tier_2_notes TEXT,
    ADD COLUMN IF NOT EXISTS approval_tier_3_status VARCHAR(20) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS approval_tier_3_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS approval_tier_3_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approval_tier_3_notes TEXT,
    ADD COLUMN IF NOT EXISTS current_approval_tier INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES auth.users(id),
    -- Part A: Applicant fields
    ADD COLUMN IF NOT EXISTS applicant_file_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS applicant_nrc VARCHAR(50),
    ADD COLUMN IF NOT EXISTS applicant_department VARCHAR(100),
    ADD COLUMN IF NOT EXISTS applicant_position VARCHAR(100),
    ADD COLUMN IF NOT EXISTS applicant_grade VARCHAR(50),
    ADD COLUMN IF NOT EXISTS applicant_salary DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS date_return_from_last_leave DATE,
    ADD COLUMN IF NOT EXISTS date_last_commuted DATE,
    ADD COLUMN IF NOT EXISTS date_last_travel_allowance DATE,
    ADD COLUMN IF NOT EXISTS days_to_commute INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS leave_address TEXT,
    -- Part B: Head of Department
    ADD COLUMN IF NOT EXISTS hod_recommendation TEXT,
    ADD COLUMN IF NOT EXISTS hod_certification_date DATE,
    ADD COLUMN IF NOT EXISTS officer_status VARCHAR(50), -- established/probation/agreement
    -- Part C: HR Officer
    ADD COLUMN IF NOT EXISTS hr_service_from DATE,
    ADD COLUMN IF NOT EXISTS hr_service_to DATE,
    ADD COLUMN IF NOT EXISTS hr_service_grade VARCHAR(50),
    ADD COLUMN IF NOT EXISTS hr_service_months INTEGER,
    ADD COLUMN IF NOT EXISTS hr_certification_date DATE,
    -- Part D: Executive Director
    ADD COLUMN IF NOT EXISTS ed_days_granted INTEGER,
    ADD COLUMN IF NOT EXISTS ed_leave_type_granted VARCHAR(100),
    ADD COLUMN IF NOT EXISTS ed_resume_duty_date DATE,
    ADD COLUMN IF NOT EXISTS ed_approval_date DATE;

-- Add check constraints for approval statuses
ALTER TABLE public.leave_requests 
    DROP CONSTRAINT IF EXISTS check_tier_1_status,
    DROP CONSTRAINT IF EXISTS check_tier_2_status,
    DROP CONSTRAINT IF EXISTS check_tier_3_status;

ALTER TABLE public.leave_requests 
    ADD CONSTRAINT check_tier_1_status CHECK (approval_tier_1_status IN ('pending', 'approved', 'rejected')),
    ADD CONSTRAINT check_tier_2_status CHECK (approval_tier_2_status IN ('pending', 'approved', 'rejected', 'not_required')),
    ADD CONSTRAINT check_tier_3_status CHECK (approval_tier_3_status IN ('pending', 'approved', 'rejected', 'not_required'));

-- Enable RLS on new tables
ALTER TABLE public.leave_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view leave categories" ON public.leave_categories;
DROP POLICY IF EXISTS "Anyone can view leave types" ON public.leave_types;

-- RLS Policies for leave_categories (read-only for all authenticated users)
CREATE POLICY "Anyone can view leave categories"
    ON public.leave_categories
    FOR SELECT
    USING (true);

-- RLS Policies for leave_types (read-only for all authenticated users)
CREATE POLICY "Anyone can view leave types"
    ON public.leave_types
    FOR SELECT
    USING (true);

-- Grant permissions
GRANT SELECT ON public.leave_categories TO authenticated;
GRANT SELECT ON public.leave_types TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_category ON public.leave_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type ON public.leave_requests(leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_current_tier ON public.leave_requests(current_approval_tier);
CREATE INDEX IF NOT EXISTS idx_leave_requests_supervisor ON public.leave_requests(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_category ON public.leave_types(category_id);

-- Function to process leave approval
CREATE OR REPLACE FUNCTION public.process_leave_approval(
    p_request_id UUID,
    p_tier INTEGER,
    p_status VARCHAR(20),
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request RECORD;
    v_category RECORD;
    v_result JSON;
BEGIN
    -- Get the leave request
    SELECT lr.*, lc.approval_tiers 
    INTO v_request
    FROM public.leave_requests lr
    JOIN public.leave_categories lc ON lc.id = lr.category_id
    WHERE lr.id = p_request_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Leave request not found');
    END IF;
    
    -- Verify this is the correct tier to approve
    IF v_request.current_approval_tier != p_tier THEN
        RETURN json_build_object('success', false, 'error', 'Invalid approval tier');
    END IF;
    
    -- Update the appropriate tier
    IF p_tier = 1 THEN
        UPDATE public.leave_requests SET
            approval_tier_1_status = p_status,
            approval_tier_1_by = auth.uid(),
            approval_tier_1_at = NOW(),
            approval_tier_1_notes = p_notes,
            current_approval_tier = CASE 
                WHEN p_status = 'approved' AND v_request.approval_tiers > 1 THEN 2
                ELSE current_approval_tier
            END,
            status = CASE 
                WHEN p_status = 'rejected' THEN 'rejected'
                WHEN p_status = 'approved' AND v_request.approval_tiers = 1 THEN 'approved'
                ELSE status
            END
        WHERE id = p_request_id;
        
    ELSIF p_tier = 2 THEN
        UPDATE public.leave_requests SET
            approval_tier_2_status = p_status,
            approval_tier_2_by = auth.uid(),
            approval_tier_2_at = NOW(),
            approval_tier_2_notes = p_notes,
            current_approval_tier = CASE 
                WHEN p_status = 'approved' AND v_request.approval_tiers > 2 THEN 3
                ELSE current_approval_tier
            END,
            status = CASE 
                WHEN p_status = 'rejected' THEN 'rejected'
                WHEN p_status = 'approved' AND v_request.approval_tiers = 2 THEN 'approved'
                ELSE status
            END
        WHERE id = p_request_id;
        
    ELSIF p_tier = 3 THEN
        UPDATE public.leave_requests SET
            approval_tier_3_status = p_status,
            approval_tier_3_by = auth.uid(),
            approval_tier_3_at = NOW(),
            approval_tier_3_notes = p_notes,
            status = CASE 
                WHEN p_status = 'rejected' THEN 'rejected'
                WHEN p_status = 'approved' THEN 'approved'
                ELSE status
            END
        WHERE id = p_request_id;
    END IF;
    
    RETURN json_build_object('success', true, 'message', 'Approval processed successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_leave_approval(UUID, INTEGER, VARCHAR, TEXT) TO authenticated;

-- Function to get leave requests with full details
CREATE OR REPLACE FUNCTION public.get_leave_requests_detailed()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email VARCHAR,
    user_name VARCHAR,
    category_id UUID,
    category_name VARCHAR,
    leave_type_id UUID,
    leave_type_name VARCHAR,
    start_date DATE,
    end_date DATE,
    days_requested INTEGER,
    reason TEXT,
    status VARCHAR,
    current_approval_tier INTEGER,
    approval_tiers INTEGER,
    approval_tier_1_status VARCHAR,
    approval_tier_1_by UUID,
    approval_tier_1_at TIMESTAMP WITH TIME ZONE,
    approval_tier_2_status VARCHAR,
    approval_tier_2_by UUID,
    approval_tier_2_at TIMESTAMP WITH TIME ZONE,
    approval_tier_3_status VARCHAR,
    approval_tier_3_by UUID,
    approval_tier_3_at TIMESTAMP WITH TIME ZONE,
    supervisor_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lr.id,
        lr.user_id,
        au.email::VARCHAR as user_email,
        COALESCE(sp.full_name, au.email)::VARCHAR as user_name,
        lr.category_id,
        lc.name::VARCHAR as category_name,
        lr.leave_type_id,
        lt.name::VARCHAR as leave_type_name,
        lr.start_date,
        lr.end_date,
        lr.days_requested,
        lr.reason,
        lr.status::VARCHAR,
        lr.current_approval_tier,
        lc.approval_tiers,
        lr.approval_tier_1_status::VARCHAR,
        lr.approval_tier_1_by,
        lr.approval_tier_1_at,
        lr.approval_tier_2_status::VARCHAR,
        lr.approval_tier_2_by,
        lr.approval_tier_2_at,
        lr.approval_tier_3_status::VARCHAR,
        lr.approval_tier_3_by,
        lr.approval_tier_3_at,
        lr.supervisor_id,
        lr.created_at
    FROM public.leave_requests lr
    LEFT JOIN auth.users au ON au.id = lr.user_id
    LEFT JOIN public.staff_profiles sp ON sp.user_id = lr.user_id
    LEFT JOIN public.leave_categories lc ON lc.id = lr.category_id
    LEFT JOIN public.leave_types lt ON lt.id = lr.leave_type_id
    ORDER BY lr.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leave_requests_detailed() TO authenticated;

-- Function to calculate working days between two dates (excluding weekends and holidays)
CREATE OR REPLACE FUNCTION public.calculate_working_days(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_working_days INTEGER := 0;
    v_current_date DATE;
    v_day_of_week INTEGER;
    v_is_holiday BOOLEAN;
BEGIN
    -- Loop through each date in the range
    v_current_date := p_start_date;
    
    WHILE v_current_date <= p_end_date LOOP
        -- Get day of week (0 = Sunday, 6 = Saturday)
        v_day_of_week := EXTRACT(DOW FROM v_current_date);
        
        -- Check if it's a weekend (Saturday or Sunday)
        IF v_day_of_week NOT IN (0, 6) THEN
            -- Check if it's a holiday
            SELECT EXISTS(
                SELECT 1 FROM public.holidays
                WHERE month = EXTRACT(MONTH FROM v_current_date)
                AND day = EXTRACT(DAY FROM v_current_date)
                AND is_active = TRUE
            ) INTO v_is_holiday;
            
            -- If not a holiday, count it as a working day
            IF NOT v_is_holiday THEN
                v_working_days := v_working_days + 1;
            END IF;
        END IF;
        
        -- Move to next day
        v_current_date := v_current_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN v_working_days;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_working_days(DATE, DATE) TO authenticated;

-- Enable RLS on holidays table
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Anyone can view holidays" ON public.holidays;

-- RLS Policy for holidays (read-only for all authenticated users)
CREATE POLICY "Anyone can view holidays"
    ON public.holidays
    FOR SELECT
    USING (true);

GRANT SELECT ON public.holidays TO authenticated;

-- Add supervisor relationship to staff_profiles if not exists
ALTER TABLE public.staff_profiles 
    ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES auth.users(id);

-- Create HR role check (users with specific positions or admin role)
-- You may need to adjust this based on your actual HR position IDs
