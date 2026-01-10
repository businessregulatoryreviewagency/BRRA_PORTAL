-- Leave Approval Permissions
-- Add RLS policies to allow designated approvers to update leave requests
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Approvers can update leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Tier 1 approvers can update" ON public.leave_requests;
DROP POLICY IF EXISTS "Tier 2 approvers can update" ON public.leave_requests;
DROP POLICY IF EXISTS "Tier 3 approvers can update" ON public.leave_requests;

-- Policy: Allow Tier 2 approvers (HR Officers) to update requests assigned to them
CREATE POLICY "Tier 2 approvers can update"
    ON public.leave_requests
    FOR UPDATE
    USING (
        approval_tier_2_by = auth.uid() AND
        current_approval_tier = 2 AND
        status = 'pending'
    );

-- Policy: Allow Tier 3 approvers (Executive Directors) to update requests assigned to them
CREATE POLICY "Tier 3 approvers can update"
    ON public.leave_requests
    FOR UPDATE
    USING (
        approval_tier_3_by = auth.uid() AND
        current_approval_tier = 3 AND
        status = 'pending'
    );

-- Policy: Allow Tier 1 approvers (Admins/HODs) to update pending requests at tier 1
-- This is already covered by the "Admins can update all leave requests" policy
-- but we'll add it explicitly for clarity
CREATE POLICY "Tier 1 approvers can update"
    ON public.leave_requests
    FOR UPDATE
    USING (
        current_approval_tier = 1 AND
        status = 'pending' AND
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Grant necessary permissions
GRANT UPDATE ON public.leave_requests TO authenticated;

-- Note: The existing "Admins can update all leave requests" policy should remain
-- as it allows admins to manage any leave request regardless of tier
