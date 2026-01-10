import { supabase } from './supabase'

/**
 * Email Service for Leave Management Notifications
 * 
 * NOTE: This service requires setting up an email provider.
 * Options include:
 * 1. Supabase Edge Functions with Resend/SendGrid
 * 2. A backend API endpoint that handles email sending
 * 3. Direct integration with an email API (requires CORS setup)
 * 
 * For now, this stores notifications in the database and logs them.
 * You can later connect this to your preferred email service.
 */

// Store notification in database for tracking
export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        metadata: metadata,
        is_read: false,
        created_at: new Date().toISOString()
      })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}

// Get user email from staff_profiles or auth
export const getUserEmail = async (userId) => {
  try {
    // First try staff_profiles (note: field is contact_email, not email)
    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('contact_email, full_name')
      .eq('user_id', userId)
      .single()
    
    if (profile?.contact_email) {
      return { email: profile.contact_email, name: profile.full_name }
    }
    
    // Fallback: The email might be in auth.users but we can't access it directly
    // Return null and handle in the calling function
    return null
  } catch (error) {
    console.error('Error getting user email:', error)
    return null
  }
}

// Send leave request notification to approver
export const notifyApprover = async (approverUserId, leaveRequest, applicantName, tierNumber) => {
  try {
    const approverInfo = await getUserEmail(approverUserId)
    
    const tierNames = {
      1: 'Head of Department',
      2: 'HR Officer',
      3: 'Executive Director'
    }
    
    const title = `Leave Request Awaiting Your Approval`
    const message = `${applicantName} has submitted a leave request that requires your approval as ${tierNames[tierNumber] || `Tier ${tierNumber} Approver`}.

Leave Details:
- Type: ${leaveRequest.leave_type || 'Annual Leave'}
- Start Date: ${leaveRequest.start_date}
- End Date: ${leaveRequest.end_date}
- Days Requested: ${leaveRequest.days_requested}
- Reason: ${leaveRequest.reason || 'Not specified'}

Please log in to the BRRA Portal to review and approve/reject this request.`

    // Create in-app notification
    await createNotification(approverUserId, 'leave_approval', title, message, {
      leave_request_id: leaveRequest.id,
      applicant_name: applicantName,
      tier: tierNumber,
      start_date: leaveRequest.start_date,
      end_date: leaveRequest.end_date,
      days_requested: leaveRequest.days_requested
    })

    // Log for debugging (replace with actual email sending)
    console.log('📧 Email notification would be sent to:', approverInfo?.email || approverUserId)
    console.log('Subject:', title)
    console.log('Message:', message)

    // TODO: Integrate with actual email service
    // Example with Resend (requires API key):
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'BRRA Portal <noreply@brra.org.zm>',
    //     to: approverInfo?.email,
    //     subject: title,
    //     text: message
    //   })
    // })

    return { success: true, approverEmail: approverInfo?.email }
  } catch (error) {
    console.error('Error notifying approver:', error)
    return { success: false, error }
  }
}

// Notify applicant of approval/rejection
export const notifyApplicant = async (applicantUserId, leaveRequest, status, approverName, tierNumber) => {
  try {
    const applicantInfo = await getUserEmail(applicantUserId)
    
    const tierNames = {
      1: 'Head of Department',
      2: 'HR Officer',
      3: 'Executive Director'
    }
    
    const statusText = status === 'approved' ? 'Approved' : 'Rejected'
    const title = `Leave Request ${statusText} - Tier ${tierNumber}`
    const message = `Your leave request has been ${statusText.toLowerCase()} by ${approverName} (${tierNames[tierNumber] || `Tier ${tierNumber} Approver`}).

Leave Details:
- Start Date: ${leaveRequest.start_date}
- End Date: ${leaveRequest.end_date}
- Days Requested: ${leaveRequest.days_requested}

${status === 'approved' && tierNumber < 3 
  ? 'Your request will now proceed to the next approval tier.' 
  : status === 'approved' 
    ? 'Your leave has been fully approved. Enjoy your time off!' 
    : 'Please contact HR if you have any questions.'}

Log in to the BRRA Portal to view the full details.`

    // Create in-app notification
    await createNotification(applicantUserId, 'leave_status', title, message, {
      leave_request_id: leaveRequest.id,
      status: status,
      tier: tierNumber,
      approver_name: approverName
    })

    console.log('📧 Status notification would be sent to:', applicantInfo?.email || applicantUserId)

    return { success: true }
  } catch (error) {
    console.error('Error notifying applicant:', error)
    return { success: false, error }
  }
}

// Send notifications after leave submission
export const sendLeaveSubmissionNotifications = async (leaveRequest, applicantName) => {
  const notifications = []

  // Notify Tier 1 approver (admin/supervisor) - this would need to be determined
  // For now, we'll skip Tier 1 as it's role-based, not user-specific

  // Notify Tier 2 approver (HR Officer) if selected
  if (leaveRequest.approval_tier_2_by) {
    const result = await notifyApprover(
      leaveRequest.approval_tier_2_by,
      leaveRequest,
      applicantName,
      2
    )
    notifications.push({ tier: 2, ...result })
  }

  // Notify Tier 3 approver (Executive Director) if selected
  if (leaveRequest.approval_tier_3_by) {
    const result = await notifyApprover(
      leaveRequest.approval_tier_3_by,
      leaveRequest,
      applicantName,
      3
    )
    notifications.push({ tier: 3, ...result })
  }

  return notifications
}

export default {
  createNotification,
  getUserEmail,
  notifyApprover,
  notifyApplicant,
  sendLeaveSubmissionNotifications
}
