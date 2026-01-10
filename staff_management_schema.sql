-- Staff Management Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grade_number INTEGER NOT NULL UNIQUE,
    grade_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff_profiles table (extends user information)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    nrc VARCHAR(50),
    file_number VARCHAR(50),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
    date_joined DATE,
    employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'terminated')),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positions_department ON public.positions(department_id);
CREATE INDEX IF NOT EXISTS idx_positions_grade ON public.positions(grade_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user ON public.staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_position ON public.staff_profiles(position_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON public.staff_profiles(department_id);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments

-- Everyone can view departments
CREATE POLICY "Anyone can view departments"
    ON public.departments
    FOR SELECT
    USING (true);

-- Only admins can insert departments
CREATE POLICY "Admins can insert departments"
    ON public.departments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update departments
CREATE POLICY "Admins can update departments"
    ON public.departments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete departments
CREATE POLICY "Admins can delete departments"
    ON public.departments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for grades (same as departments)

CREATE POLICY "Anyone can view grades"
    ON public.grades
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert grades"
    ON public.grades
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update grades"
    ON public.grades
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete grades"
    ON public.grades
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for positions (same as departments)

CREATE POLICY "Anyone can view positions"
    ON public.positions
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert positions"
    ON public.positions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update positions"
    ON public.positions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete positions"
    ON public.positions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for staff_profiles

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.staff_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Staff and admins can view all profiles
CREATE POLICY "Staff and admins can view all profiles"
    ON public.staff_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.staff_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
    ON public.staff_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
    ON public.staff_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Update triggers for updated_at

CREATE OR REPLACE FUNCTION public.update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_grades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_staff_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_departments_updated_at();

DROP TRIGGER IF EXISTS update_grades_updated_at ON public.grades;
CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_grades_updated_at();

DROP TRIGGER IF EXISTS update_positions_updated_at ON public.positions;
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_positions_updated_at();

DROP TRIGGER IF EXISTS update_staff_profiles_updated_at ON public.staff_profiles;
CREATE TRIGGER update_staff_profiles_updated_at
    BEFORE UPDATE ON public.staff_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_staff_profiles_updated_at();

-- Grant permissions
GRANT ALL ON public.departments TO authenticated;
GRANT ALL ON public.grades TO authenticated;
GRANT ALL ON public.positions TO authenticated;
GRANT ALL ON public.staff_profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert initial departments
INSERT INTO public.departments (name, description) VALUES
('Office of the ED', 'Executive Director Office'),
('Business Facilitation', 'Business Facilitation Department'),
('Regulatory Affairs', 'Regulatory Affairs Department'),
('Legal Unit', 'Legal and Board Secretary Unit'),
('Finance', 'Finance Department'),
('Internal Audit', 'Internal Audit Department'),
('Administration', 'Administration Department')
ON CONFLICT (name) DO NOTHING;

-- Insert initial grades
INSERT INTO public.grades (grade_number, grade_name) VALUES
(1, 'Grade 1 - Executive'),
(2, 'Grade 2 - Director'),
(3, 'Grade 3 - Manager'),
(4, 'Grade 4 - Senior Officer'),
(5, 'Grade 5 - Officer')
ON CONFLICT (grade_number) DO NOTHING;

-- Insert initial positions
-- Note: This uses subqueries to get department and grade IDs
INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Executive Director',
    (SELECT id FROM public.departments WHERE name = 'Office of the ED'),
    (SELECT id FROM public.grades WHERE grade_number = 1)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Executive Director');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Director - Business Facilitation',
    (SELECT id FROM public.departments WHERE name = 'Business Facilitation'),
    (SELECT id FROM public.grades WHERE grade_number = 2)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Director - Business Facilitation');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Director - Regulatory Affairs',
    (SELECT id FROM public.departments WHERE name = 'Regulatory Affairs'),
    (SELECT id FROM public.grades WHERE grade_number = 2)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Director - Regulatory Affairs');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Director - Legal and Board Secretary',
    (SELECT id FROM public.departments WHERE name = 'Legal Unit'),
    (SELECT id FROM public.grades WHERE grade_number = 2)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Director - Legal and Board Secretary');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Manager - Finance',
    (SELECT id FROM public.departments WHERE name = 'Finance'),
    (SELECT id FROM public.grades WHERE grade_number = 3)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Manager - Finance');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Manager – Internal Audit',
    (SELECT id FROM public.departments WHERE name = 'Internal Audit'),
    (SELECT id FROM public.grades WHERE grade_number = 3)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Manager – Internal Audit');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Manager – Regulatory Services & Licensing Systems',
    (SELECT id FROM public.departments WHERE name = 'Business Facilitation'),
    (SELECT id FROM public.grades WHERE grade_number = 3)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Manager – Regulatory Services & Licensing Systems');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Senior Public Relations Officer',
    (SELECT id FROM public.departments WHERE name = 'Administration'),
    (SELECT id FROM public.grades WHERE grade_number = 4)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Senior Public Relations Officer');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Senior Regulatory Impact Assessments Analyst',
    (SELECT id FROM public.departments WHERE name = 'Regulatory Affairs'),
    (SELECT id FROM public.grades WHERE grade_number = 4)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Senior Regulatory Impact Assessments Analyst');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Senior Systems Analyst',
    (SELECT id FROM public.departments WHERE name = 'Business Facilitation'),
    (SELECT id FROM public.grades WHERE grade_number = 4)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Senior Systems Analyst');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Accountant',
    (SELECT id FROM public.departments WHERE name = 'Finance'),
    (SELECT id FROM public.grades WHERE grade_number = 5)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Accountant');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Procurement Officer',
    (SELECT id FROM public.departments WHERE name = 'Administration'),
    (SELECT id FROM public.grades WHERE grade_number = 5)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Procurement Officer');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Human Resources & Information Systems Clerk',
    (SELECT id FROM public.departments WHERE name = 'Administration'),
    (SELECT id FROM public.grades WHERE grade_number = 5)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Human Resources & Information Systems Clerk');

INSERT INTO public.positions (title, department_id, grade_id)
SELECT 
    'Executive assistant',
    (SELECT id FROM public.departments WHERE name = 'Office of the ED'),
    (SELECT id FROM public.grades WHERE grade_number = 5)
WHERE NOT EXISTS (SELECT 1 FROM public.positions WHERE title = 'Executive assistant');
