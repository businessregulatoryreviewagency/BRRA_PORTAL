import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { sendLeaveSubmissionNotifications } from '../lib/emailService'

const AnnualLeaveForm = ({ onClose, onSubmit }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [staffProfile, setStaffProfile] = useState(null)
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [grades, setGrades] = useState([])
  const [hrStaff, setHrStaff] = useState([])
  const [executives, setExecutives] = useState([])
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    // Part A - Applicant Details
    applicant_file_number: '',
    applicant_nrc: '',
    applicant_department: '',
    applicant_position: '',
    applicant_grade: '',
    applicant_salary: '',
    date_return_from_last_leave: '',
    date_last_commuted: '',
    date_last_travel_allowance: '',
    start_date: '',
    end_date: '',
    days_requested: 0,
    days_to_commute: 0,
    leave_address: '',
    reason: '',
    hr_officer_id: '',
    executive_director_id: ''
  })

  useEffect(() => {
    fetchStaffProfile()
    fetchDropdownData()
    fetchApprovers()
  }, [])

  // Validation effect
  useEffect(() => {
    validateForm()
  }, [formData.start_date, formData.end_date, formData.date_return_from_last_leave])

  const validateForm = () => {
    const newErrors = {}

    // Validate end date is not before start date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        newErrors.end_date = 'End date cannot be before start date'
      }
    }

    // Validate date of return from last leave cannot be after start date of current leave
    if (formData.date_return_from_last_leave && formData.start_date) {
      const returnDate = new Date(formData.date_return_from_last_leave)
      const startDate = new Date(formData.start_date)
      if (returnDate > startDate) {
        newErrors.date_return_from_last_leave = 'Return date from last leave cannot be after the start date of current leave request'
      }
    }

    setErrors(newErrors)
  }

  const isFormValid = () => {
    // Check if there are any errors
    if (Object.keys(errors).length > 0) return false
    
    // Check required fields
    if (!formData.applicant_nrc) return false
    if (!formData.applicant_department) return false
    if (!formData.applicant_position) return false
    if (!formData.start_date) return false
    if (!formData.end_date) return false
    if (!formData.leave_address) return false
    if (!formData.hr_officer_id) return false
    if (!formData.executive_director_id) return false
    
    return true
  }

  const fetchStaffProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          departments(name),
          positions(title),
          grades(grade_number, grade_name)
        `)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setStaffProfile(data)
        setFormData(prev => ({
          ...prev,
          applicant_file_number: data.file_number || '',
          applicant_nrc: data.nrc || '',
          applicant_department: data.departments?.name || '',
          applicant_position: data.positions?.title || '',
          applicant_grade: data.grades ? `Grade ${data.grades.grade_number} - ${data.grades.grade_name}` : '',
          leave_address: data.address || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [deptRes, posRes, gradeRes] = await Promise.all([
        supabase.from('departments').select('id, name').order('name'),
        supabase.from('positions').select('id, title').order('title'),
        supabase.from('grades').select('id, grade_number, grade_name').order('grade_number')
      ])
      
      setDepartments(deptRes.data || [])
      setPositions(posRes.data || [])
      setGrades(gradeRes.data || [])
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  const fetchApprovers = async () => {
    try {
      // Fetch all staff with their positions using left join
      const { data: allStaff, error: staffError } = await supabase
        .from('staff_profiles')
        .select(`
          user_id,
          full_name,
          position_id,
          positions(id, title)
        `)
        .not('full_name', 'is', null)
        .order('full_name')

      console.log('All staff fetched:', allStaff)

      if (staffError) {
        console.error('Staff fetch error:', staffError)
        throw staffError
      }

      if (!allStaff || allStaff.length === 0) {
        console.warn('No staff found in database')
        setHrStaff([])
        setExecutives([])
        return
      }

      // Show all staff for both dropdowns - allows any staff to act as approver
      setHrStaff(allStaff)
      setExecutives(allStaff)
    } catch (err) {
      console.error('Error fetching approvers:', err)
    }
  }

  const calculateWorkingDays = async (startDate, endDate) => {
    if (!startDate || !endDate) return 0
    
    try {
      const { data, error } = await supabase.rpc('calculate_working_days', {
        p_start_date: startDate,
        p_end_date: endDate
      })
      
      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error calculating working days:', error)
      // Fallback to simple calculation
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
  }

  useEffect(() => {
    const updateDays = async () => {
      if (formData.start_date && formData.end_date) {
        const days = await calculateWorkingDays(formData.start_date, formData.end_date)
        setFormData(prev => ({ ...prev, days_requested: days }))
      }
    }
    updateDays()
  }, [formData.start_date, formData.end_date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get annual leave category
      const { data: categories } = await supabase
        .from('leave_categories')
        .select('id, approval_tiers')
        .eq('name', 'annual_leave')
        .single()

      if (!categories) {
        throw new Error('Annual leave category not found')
      }

      const leaveData = {
        user_id: user.id,
        category_id: categories.id,
        leave_type: 'annual',
        start_date: formData.start_date,
        end_date: formData.end_date,
        days_requested: formData.days_requested,
        reason: formData.reason,
        status: 'pending',
        current_approval_tier: 1,
        approval_tier_1_status: 'pending',
        approval_tier_2_status: 'pending',
        approval_tier_3_status: 'pending',
        // Part A fields
        applicant_file_number: formData.applicant_file_number,
        applicant_nrc: formData.applicant_nrc,
        applicant_department: formData.applicant_department,
        applicant_position: formData.applicant_position,
        applicant_grade: formData.applicant_grade,
        applicant_salary: formData.applicant_salary ? parseFloat(formData.applicant_salary) : null,
        date_return_from_last_leave: formData.date_return_from_last_leave || null,
        date_last_commuted: formData.date_last_commuted || null,
        date_last_travel_allowance: formData.date_last_travel_allowance || null,
        days_to_commute: parseInt(formData.days_to_commute) || 0,
        leave_address: formData.leave_address,
        // Store selected approvers
        approval_tier_2_by: formData.hr_officer_id || null,
        approval_tier_3_by: formData.executive_director_id || null
      }

      const { error } = await supabase
        .from('leave_requests')
        .insert(leaveData)

      if (error) throw error

      // Send notifications to selected approvers
      try {
        const leaveRequestWithId = { ...leaveData, id: 'new' }
        await sendLeaveSubmissionNotifications(leaveRequestWithId, staffProfile?.full_name || 'Staff Member')
        console.log('Notifications sent to approvers')
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError)
        // Don't fail the submission if notifications fail
      }

      alert('Annual leave application submitted successfully! Approvers have been notified.')
      if (onSubmit) onSubmit()
      if (onClose) onClose()
    } catch (error) {
      console.error('Error submitting leave application:', error)
      alert('Failed to submit leave application: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl">
          <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">APPLICATION FOR LEAVE</h2>
                <p className="text-sm text-gray-600 mt-1">Complete all sections of this form</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Distribution Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">DISTRIBUTION:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Original to: Officer</li>
              <li>• Copy to: Officers File, Finance Unit, Head of Department</li>
            </ul>
          </div>

          {/* PART A - Applicant */}
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 bg-gray-100 -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
              PART A - To be completed by Applicant
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Names *
                </label>
                <input
                  type="text"
                  value={staffProfile?.full_name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File No
                </label>
                <input
                  type="text"
                  value={formData.applicant_file_number}
                  onChange={(e) => setFormData({ ...formData, applicant_file_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NRC No *
                </label>
                <input
                  type="text"
                  value={formData.applicant_nrc}
                  onChange={(e) => setFormData({ ...formData, applicant_nrc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  value={formData.applicant_department}
                  onChange={(e) => setFormData({ ...formData, applicant_department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  value={formData.applicant_position}
                  onChange={(e) => setFormData({ ...formData, applicant_position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  type="text"
                  value={formData.applicant_grade}
                  onChange={(e) => setFormData({ ...formData, applicant_grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary per annum
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.applicant_salary}
                  onChange={(e) => setFormData({ ...formData, applicant_salary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of return to duty after last leave (or date of appointment if leave not previously taken)
                </label>
                {errors.date_return_from_last_leave && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {errors.date_return_from_last_leave}
                    </p>
                  </div>
                )}
                <input
                  type="date"
                  value={formData.date_return_from_last_leave}
                  onChange={(e) => setFormData({ ...formData, date_return_from_last_leave: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                    errors.date_return_from_last_leave 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date last commuted
                </label>
                <input
                  type="date"
                  value={formData.date_last_commuted}
                  onChange={(e) => setFormData({ ...formData, date_last_commuted: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date last travel allowance was received
                </label>
                <input
                  type="date"
                  value={formData.date_last_travel_allowance}
                  onChange={(e) => setFormData({ ...formData, date_last_travel_allowance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                {errors.end_date && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center">
                      <i className="ri-error-warning-line mr-1"></i>
                      {errors.end_date}
                    </p>
                  </div>
                )}
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                    errors.end_date 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Days (excl. weekends & holidays)
                </label>
                <input
                  type="number"
                  value={formData.days_requested}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-blue-50 font-semibold text-blue-900"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days to commute (to be deducted from earned leave)
                </label>
                <input
                  type="number"
                  value={formData.days_to_commute}
                  onChange={(e) => setFormData({ ...formData, days_to_commute: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  My address on leave will be *
                </label>
                <textarea
                  value={formData.leave_address}
                  onChange={(e) => setFormData({ ...formData, leave_address: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your address during leave period"
                  required
                ></textarea>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide reason for your leave request"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Approvers Selection */}
          <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              <i className="ri-user-star-line mr-2"></i>
              Select Approvers
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HR Officer / Acting (Tier 2 Approver) *
                </label>
                <select
                  value={formData.hr_officer_id}
                  onChange={(e) => setFormData({ ...formData, hr_officer_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {hrStaff.length === 0 && <option disabled>No staff found</option>}
                  {hrStaff.map((staff) => (
                    <option key={staff.user_id} value={staff.user_id}>
                      {staff.full_name || 'Unknown'} {staff.positions?.title ? `(${staff.positions.title})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Will complete Part C - HR certification
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Executive Director / Acting (Tier 3 Approver) *
                </label>
                <select
                  value={formData.executive_director_id}
                  onChange={(e) => setFormData({ ...formData, executive_director_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {executives.length === 0 && <option disabled>No staff found</option>}
                  {executives.map((staff) => (
                    <option key={staff.user_id} value={staff.user_id}>
                      {staff.full_name || 'Unknown'} {staff.positions?.title ? `(${staff.positions.title})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Will complete Part D - Final approval
                </p>
              </div>
            </div>
          </div>

          {/* Information about Parts B, C, D */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              <i className="ri-information-line mr-1"></i>
              Approval Process
            </p>
            <div className="text-xs text-amber-800 space-y-1">
              <p><strong>Part B:</strong> Will be completed by Head of Department (Tier 1 Approval)</p>
              <p><strong>Part C:</strong> Will be completed by selected HR Officer or Acting (Tier 2 Approval)</p>
              <p><strong>Part D:</strong> Will be completed by selected Executive Director or Acting (Tier 3 Approval)</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isFormValid() ? 'Please fix validation errors and fill all required fields' : ''}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
          {!isFormValid() && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center">
                <i className="ri-information-line mr-2"></i>
                Please fix validation errors and complete all required fields before submitting.
              </p>
            </div>
          )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default AnnualLeaveForm
