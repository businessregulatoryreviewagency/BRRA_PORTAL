import { useState } from 'react'
import { supabase } from '../lib/supabase'

const AnnualLeaveApprovalModal = ({ request, onClose, onApprove, userRole }) => {
  const [loading, setLoading] = useState(false)
  const [approvalData, setApprovalData] = useState({
    // Part B - HOD
    hod_recommendation: '',
    officer_status: 'established',
    // Part C - HR
    hr_service_from: '',
    hr_service_to: '',
    hr_service_grade: '',
    hr_service_months: '',
    // Part D - ED
    ed_days_granted: request.days_requested,
    ed_leave_type_granted: 'Annual Leave',
    ed_resume_duty_date: '',
    approval_notes: ''
  })

  const currentTier = request.current_approval_tier || 1
  const isHOD = currentTier === 1
  const isHR = currentTier === 2
  const isED = currentTier === 3

  const handleApprove = async () => {
    setLoading(true)
    try {
      const updateData = {
        [`approval_tier_${currentTier}_status`]: 'approved',
        [`approval_tier_${currentTier}_by`]: (await supabase.auth.getUser()).data.user.id,
        [`approval_tier_${currentTier}_at`]: new Date().toISOString(),
        [`approval_tier_${currentTier}_notes`]: approvalData.approval_notes
      }

      // Add specific fields based on tier
      if (isHOD) {
        updateData.hod_recommendation = approvalData.hod_recommendation
        updateData.hod_certification_date = new Date().toISOString().split('T')[0]
        updateData.officer_status = approvalData.officer_status
        updateData.current_approval_tier = 2
      } else if (isHR) {
        updateData.hr_service_from = approvalData.hr_service_from
        updateData.hr_service_to = approvalData.hr_service_to
        updateData.hr_service_grade = approvalData.hr_service_grade
        updateData.hr_service_months = parseInt(approvalData.hr_service_months) || 0
        updateData.hr_certification_date = new Date().toISOString().split('T')[0]
        updateData.current_approval_tier = 3
      } else if (isED) {
        updateData.ed_days_granted = parseInt(approvalData.ed_days_granted)
        updateData.ed_leave_type_granted = approvalData.ed_leave_type_granted
        updateData.ed_resume_duty_date = approvalData.ed_resume_duty_date
        updateData.ed_approval_date = new Date().toISOString().split('T')[0]
        updateData.status = 'approved'
      }

      const { error } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', request.id)

      if (error) throw error

      alert(`Part ${isHOD ? 'B' : isHR ? 'C' : 'D'} completed successfully!`)
      if (onApprove) onApprove()
      onClose()
    } catch (error) {
      console.error('Error approving:', error)
      alert('Failed to approve: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this leave application?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          [`approval_tier_${currentTier}_status`]: 'rejected',
          [`approval_tier_${currentTier}_by`]: (await supabase.auth.getUser()).data.user.id,
          [`approval_tier_${currentTier}_at`]: new Date().toISOString(),
          [`approval_tier_${currentTier}_notes`]: approvalData.approval_notes,
          status: 'rejected'
        })
        .eq('id', request.id)

      if (error) throw error

      alert('Leave application rejected')
      if (onApprove) onApprove()
      onClose()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Failed to reject: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Annual Leave Application - Part {isHOD ? 'B' : isHR ? 'C' : 'D'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isHOD && 'Head of Department Review'}
                {isHR && 'HR Officer Certification'}
                {isED && 'Executive Director Approval'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Part A Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">PART A - Applicant Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium">{request.user_name || request.user_email}</p>
              </div>
              <div>
                <p className="text-gray-500">File No</p>
                <p className="font-medium">{request.applicant_file_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">NRC No</p>
                <p className="font-medium">{request.applicant_nrc || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{request.applicant_department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Position</p>
                <p className="font-medium">{request.applicant_position || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Grade</p>
                <p className="font-medium">{request.applicant_grade || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Leave Period</p>
                <p className="font-medium">
                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Days Requested</p>
                <p className="font-medium">{request.days_requested} days</p>
              </div>
              <div>
                <p className="text-gray-500">Days to Commute</p>
                <p className="font-medium">{request.days_to_commute || 0} days</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-gray-500">Leave Address</p>
                <p className="font-medium">{request.leave_address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Part B - HOD */}
          {isHOD && (
            <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                PART B - To be completed by Head of Department
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendation
                  </label>
                  <textarea
                    value={approvalData.hod_recommendation}
                    onChange={(e) => setApprovalData({ ...approvalData, hod_recommendation: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="The foregoing application is forwarded and recommended. I certify that the details are correct."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Officer Status *
                  </label>
                  <select
                    value={approvalData.officer_status}
                    onChange={(e) => setApprovalData({ ...approvalData, officer_status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="established">Established Officer</option>
                    <option value="probation">Serving on Probation</option>
                    <option value="agreement">Serving on Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={approvalData.approval_notes}
                    onChange={(e) => setApprovalData({ ...approvalData, approval_notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional comments..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Part C - HR */}
          {isHR && (
            <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                PART C - To be completed by Human Resource Officer
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-700 mb-4">
                  Date of return to duty after last leave to date of proposed leave:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service From *
                    </label>
                    <input
                      type="date"
                      value={approvalData.hr_service_from}
                      onChange={(e) => setApprovalData({ ...approvalData, hr_service_from: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service To *
                    </label>
                    <input
                      type="date"
                      value={approvalData.hr_service_to}
                      onChange={(e) => setApprovalData({ ...approvalData, hr_service_to: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={approvalData.hr_service_grade}
                      onChange={(e) => setApprovalData({ ...approvalData, hr_service_grade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Grade during service period"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Months in Service
                    </label>
                    <input
                      type="number"
                      value={approvalData.hr_service_months}
                      onChange={(e) => setApprovalData({ ...approvalData, hr_service_months: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Number of months"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={approvalData.approval_notes}
                    onChange={(e) => setApprovalData({ ...approvalData, approval_notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional comments..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Part D - ED */}
          {isED && (
            <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                PART D - To be completed by Executive Director
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days Granted *
                    </label>
                    <input
                      type="number"
                      value={approvalData.ed_days_granted}
                      onChange={(e) => setApprovalData({ ...approvalData, ed_days_granted: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type Granted *
                    </label>
                    <input
                      type="text"
                      value={approvalData.ed_leave_type_granted}
                      onChange={(e) => setApprovalData({ ...approvalData, ed_leave_type_granted: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Officer to Resume Duty On *
                    </label>
                    <input
                      type="date"
                      value={approvalData.ed_resume_duty_date}
                      onChange={(e) => setApprovalData({ ...approvalData, ed_resume_duty_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={approvalData.approval_notes}
                    onChange={(e) => setApprovalData({ ...approvalData, approval_notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional comments..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <i className="ri-close-line mr-1"></i>
              Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <i className="ri-check-line mr-1"></i>
              {loading ? 'Processing...' : `Approve Part ${isHOD ? 'B' : isHR ? 'C' : 'D'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnnualLeaveApprovalModal
