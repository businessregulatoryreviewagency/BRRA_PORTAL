-- Leave Management Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'personal', 'emergency')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Enable Row Level Security
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_requests table

-- Policy: Users can view their own leave requests
CREATE POLICY "Users can view own leave requests"
    ON public.leave_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Staff and admins can view all leave requests
CREATE POLICY "Staff and admins can view all leave requests"
    ON public.leave_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Policy: Staff can insert their own leave requests
CREATE POLICY "Staff can create leave requests"
    ON public.leave_requests
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
        )
    );

-- Policy: Users can update their own pending leave requests
CREATE POLICY "Users can update own pending requests"
    ON public.leave_requests
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy: Admins can update any leave request (for approval/rejection)
CREATE POLICY "Admins can update all leave requests"
    ON public.leave_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can delete their own pending leave requests
CREATE POLICY "Users can delete own pending requests"
    ON public.leave_requests
    FOR DELETE
    USING (auth.uid() = user_id AND status = 'pending');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_leave_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leave_requests_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.leave_requests TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime for leave_requests table (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;

-- Function to get leave statistics for a user
CREATE OR REPLACE FUNCTION public.get_leave_statistics(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_requests', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'total_days_approved', COALESCE(SUM(days_requested) FILTER (WHERE status = 'approved'), 0),
        'total_days_pending', COALESCE(SUM(days_requested) FILTER (WHERE status = 'pending'), 0)
    )
    INTO result
    FROM public.leave_requests
    WHERE user_id = target_user_id;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_leave_statistics(UUID) TO authenticated;
