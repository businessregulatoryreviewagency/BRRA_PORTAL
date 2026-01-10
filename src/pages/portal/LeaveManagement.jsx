import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AnnualLeaveForm from '../../components/AnnualLeaveForm'
import AnnualLeaveApprovalModal from '../../components/AnnualLeaveApprovalModal'

const LeaveManagement = () => {
  const { user, userRole } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAnnualLeaveForm, setShowAnnualLeaveForm] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('my-requests')
  const [leaveCategories, setLeaveCategories] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [newRequest, setNewRequest] = useState({
    category_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    days_requested: 0
  })

  useEffect(() => {
    fetchLeaveRequests()
    fetchLeaveCategories()
    fetchLeaveTypes()
  }, [])

  const fetchLeaveCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setLeaveCategories(data || [])
    } catch (error) {
      console.error('Error fetching leave categories:', error)
    }
  }

  const fetchLeaveTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*, leave_categories(name)')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setLeaveTypes(data || [])
    } catch (error) {
      console.error('Error fetching leave types:', error)
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      
      // Always fetch all leave requests for admins to see pending approvals
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          leave_categories(name, approval_tiers),
          leave_types(name)
        `)
        .order('created_at', { ascending: false })

      const { data: allData, error: queryError } = await query
      if (queryError) throw queryError
      
      console.log('All leave requests fetched:', allData?.length || 0)
      console.log('Current user ID:', user?.id)
      console.log('User role:', userRole)
      
      setLeaveRequests(allData || [])
    } catch (error) {
      console.error('Error fetching leave requests:', error)
    } finally {
      setLoading(false)
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

  const handleRequestSubmit = async (e) => {
    e.preventDefault()

    if (!newRequest.start_date || !newRequest.end_date) {
      alert('Please select start and end dates')
      return
    }

    if (!newRequest.category_id) {
      alert('Please select a leave category')
      return
    }

    const days = await calculateWorkingDays(newRequest.start_date, newRequest.end_date)
    const selectedCategory = leaveCategories.find(c => c.id === newRequest.category_id)

    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          category_id: newRequest.category_id,
          leave_type_id: newRequest.leave_type_id || null,
          leave_type: selectedCategory?.name || 'annual',
          start_date: newRequest.start_date,
          end_date: newRequest.end_date,
          days_requested: days,
          reason: newRequest.reason,
          status: 'pending',
          current_approval_tier: 1,
          approval_tier_1_status: 'pending',
          approval_tier_2_status: selectedCategory?.approval_tiers >= 2 ? 'pending' : 'not_required',
          approval_tier_3_status: selectedCategory?.approval_tiers >= 3 ? 'pending' : 'not_required'
        })

      if (error) throw error

      await fetchLeaveRequests()
      setShowRequestModal(false)
      setNewRequest({
        category_id: '',
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
        days_requested: 0
      })
      alert('Leave request submitted successfully!')
    } catch (error) {
      console.error('Error submitting leave request:', error)
      alert('Failed to submit leave request: ' + error.message)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId)

      if (error) throw error

      await fetchLeaveRequests()
      alert(`Leave request ${newStatus}!`)
    } catch (error) {
      console.error('Error updating leave status:', error)
      alert('Failed to update leave status: ' + error.message)
    }
  }

  const openApprovalModal = (request) => {
    setSelectedRequest(request)
    setApprovalNotes('')
    // Use AnnualLeaveApprovalModal for annual leave, regular modal for others
    if (request.category_name === 'annual_leave' || request.leave_type === 'annual_leave') {
      setShowApprovalModal(true)
    } else {
      setShowApprovalModal(true)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      await fetchLeaveRequests()
      alert('Leave request deleted successfully!')
    } catch (error) {
      console.error('Error deleting leave request:', error)
      alert('Failed to delete leave request: ' + error.message)
    }
  }

  const handleTierApproval = async (status) => {
    if (!selectedRequest) return

    const tier = selectedRequest.current_approval_tier || 1
    const approvalTiers = selectedRequest.approval_tiers || selectedRequest.leave_categories?.approval_tiers || 1

    try {
      // Try RPC first
      const { data, error: rpcError } = await supabase.rpc('process_leave_approval', {
        p_request_id: selectedRequest.id,
        p_tier: tier,
        p_status: status,
        p_notes: approvalNotes
      })

      if (rpcError) {
        // Fallback to direct update
        const updateData = {
          [`approval_tier_${tier}_status`]: status,
          [`approval_tier_${tier}_by`]: user.id,
          [`approval_tier_${tier}_at`]: new Date().toISOString(),
          [`approval_tier_${tier}_notes`]: approvalNotes
        }

        // Update current tier and overall status
        if (status === 'rejected') {
          updateData.status = 'rejected'
        } else if (status === 'approved') {
          if (tier >= approvalTiers) {
            updateData.status = 'approved'
          } else {
            updateData.current_approval_tier = tier + 1
          }
        }

        const { error } = await supabase
          .from('leave_requests')
          .update(updateData)
          .eq('id', selectedRequest.id)

        if (error) throw error
      }

      await fetchLeaveRequests()
      setShowApprovalModal(false)
      setSelectedRequest(null)
      alert(`Tier ${tier} approval ${status}!`)
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Failed to process approval: ' + error.message)
    }
  }

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'annual_leave': return 'Annual Leave'
      case 'local_leave': return 'Local/Casual Leave'
      case 'claim_annual_days': return 'Claim Annual Days'
      default: return category
    }
  }

  const getTierLabel = (tier) => {
    switch (tier) {
      case 1: return 'Supervisor'
      case 2: return 'HR'
      case 3: return 'ED'
      default: return `Tier ${tier}`
    }
  }

  const getApprovalProgress = (request) => {
    const tiers = request.approval_tiers || request.leave_categories?.approval_tiers || 1
    const progress = []
    
    for (let i = 1; i <= tiers; i++) {
      const status = request[`approval_tier_${i}_status`] || 'pending'
      progress.push({
        tier: i,
        label: getTierLabel(i),
        status: status
      })
    }
    
    return progress
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'annual':
        return 'ri-calendar-line'
      case 'sick':
        return 'ri-heart-pulse-line'
      case 'personal':
        return 'ri-user-line'
      case 'emergency':
        return 'ri-alarm-warning-line'
      default:
        return 'ri-calendar-line'
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesCategory = filterCategory === 'all' || 
      request.category_id === filterCategory || 
      request.category_name === filterCategory
    return matchesStatus && matchesCategory
  })

  const pendingApprovals = leaveRequests.filter(request => {
    console.log('Checking request:', {
      id: request.id,
      status: request.status,
      currentTier: request.current_approval_tier,
      tier1Status: request.approval_tier_1_status,
      tier2Status: request.approval_tier_2_status,
      tier2By: request.approval_tier_2_by,
      tier3Status: request.approval_tier_3_status,
      tier3By: request.approval_tier_3_by,
      userId: user?.id,
      userRole: userRole
    })
    
    if (request.status !== 'pending') return false
    // Show requests that need approval at current tier
    const currentTier = request.current_approval_tier || 1
    const tierStatus = request[`approval_tier_${currentTier}_status`]
    if (tierStatus !== 'pending') return false
    
    // Check if current user is the designated approver for this tier
    // Tier 1: Head of Department (admin role can approve)
    // Tier 2: HR Officer (check approval_tier_2_by)
    // Tier 3: Executive Director (check approval_tier_3_by)
    if (currentTier === 1) {
      // Tier 1 can be approved by admins or supervisors
      const canApprove = userRole === 'admin'
      console.log('Tier 1 check:', canApprove)
      return canApprove
    } else if (currentTier === 2) {
      // Tier 2: Check if current user is the selected HR officer
      const canApprove = request.approval_tier_2_by === user?.id
      console.log('Tier 2 check:', canApprove, 'Expected:', request.approval_tier_2_by, 'Got:', user?.id)
      return canApprove
    } else if (currentTier === 3) {
      // Tier 3: Check if current user is the selected Executive Director
      const canApprove = request.approval_tier_3_by === user?.id
      console.log('Tier 3 check:', canApprove, 'Expected:', request.approval_tier_3_by, 'Got:', user?.id)
      return canApprove
    }
    return false
  })
  
  console.log('Pending approvals for current user:', pendingApprovals.length)

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length
  }

  return (
    <div>
      {/* Pending Approvals Alert Banner */}
      {pendingApprovals.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-notification-badge-line text-3xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">You Have {pendingApprovals.length} Leave Request{pendingApprovals.length > 1 ? 's' : ''} to Review</h2>
                <p className="text-white/80 mt-1">These requests are waiting for your approval or rejection</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('pending-approvals')}
              className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
            >
              Review Now
            </button>
          </div>
          
          {/* Quick preview of pending approvals */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingApprovals.slice(0, 3).map(request => (
              <div key={request.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.staff_name || 'Staff Member'}</p>
                    <p className="text-sm text-white/70">
                      {request.days_requested} day{request.days_requested > 1 ? 's' : ''} • 
                      Tier {request.current_approval_tier || 1} Approval
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowApprovalModal(true)
                    }}
                    className="px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-2">Manage and track leave requests</p>
          </div>
          {userRole === 'staff' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowAnnualLeaveForm(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <i className="ri-file-text-line mr-2"></i>
                Annual Leave Application
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <i className="ri-add-line mr-2"></i>
                Quick Leave Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <i className="ri-close-circle-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Admin */}
      {userRole === 'admin' && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all-requests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all-requests' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab('pending-approvals')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending-approvals' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Pending Approvals ({pendingApprovals.length})
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {leaveCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{getCategoryDisplayName(cat.name)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Leave Requests ({filteredRequests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-calendar-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No leave requests found</p>
              <p className="text-sm text-gray-500 mt-1">
                {userRole === 'staff' ? 'Click "Request Leave" to submit a new request' : 'No requests to review'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {userRole === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.user_name || request.user_email || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{request.user_email}</p>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {getCategoryDisplayName(request.category_name || request.leave_categories?.name || request.leave_type)}
                        </span>
                        {request.leave_type_name && (
                          <p className="text-xs text-gray-500">{request.leave_type_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {request.days_requested} days
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {request.reason || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getApprovalProgress(request).map((tier, idx) => (
                          <div key={idx} className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              tier.status === 'approved' ? 'bg-green-100 text-green-700' :
                              tier.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              tier.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-400'
                            }`} title={`${tier.label}: ${tier.status}`}>
                              {tier.status === 'approved' ? '✓' : tier.status === 'rejected' ? '✕' : tier.tier}
                            </span>
                            {idx < getApprovalProgress(request).length - 1 && (
                              <span className="w-2 h-0.5 bg-gray-300 mx-0.5"></span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {/* Review button for admins or designated approvers */}
                        {userRole === 'admin' && request.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowApprovalModal(true)
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100"
                          >
                            <i className="ri-check-double-line mr-1"></i>
                            Review
                          </button>
                        )}
                        {/* Delete button for own pending requests */}
                        {request.user_id === user?.id && request.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="px-3 py-1 bg-red-50 text-red-600 font-medium rounded hover:bg-red-100"
                            title="Delete this request"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Request Leave</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Category *
                  </label>
                  <select
                    value={newRequest.category_id}
                    onChange={(e) => setNewRequest({ ...newRequest, category_id: e.target.value, leave_type_id: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {leaveCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryDisplayName(cat.name)} ({cat.approval_tiers}-tier approval)
                      </option>
                    ))}
                  </select>
                  {newRequest.category_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="ri-information-line mr-1"></i>
                      {leaveCategories.find(c => c.id === newRequest.category_id)?.approval_tiers === 1 && 'Requires Supervisor approval only'}
                      {leaveCategories.find(c => c.id === newRequest.category_id)?.approval_tiers === 2 && 'Requires Supervisor → HR approval'}
                      {leaveCategories.find(c => c.id === newRequest.category_id)?.approval_tiers === 3 && 'Requires Supervisor → HR → ED approval'}
                    </p>
                  )}
                </div>

                {/* Show leave types for Local Leave category */}
                {newRequest.category_id && leaveCategories.find(c => c.id === newRequest.category_id)?.name === 'local_leave' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type
                    </label>
                    <select
                      value={newRequest.leave_type_id}
                      onChange={(e) => setNewRequest({ ...newRequest, leave_type_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      {leaveTypes
                        .filter(t => t.category_id === newRequest.category_id)
                        .map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.start_date}
                    onChange={(e) => setNewRequest({ ...newRequest, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.end_date}
                    onChange={(e) => setNewRequest({ ...newRequest, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {newRequest.start_date && newRequest.end_date && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <i className="ri-information-line mr-1"></i>
                      Total days: <strong>{calculateDays(newRequest.start_date, newRequest.end_date)}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide a reason for your leave request..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal - Use AnnualLeaveApprovalModal for annual leave */}
      {showApprovalModal && selectedRequest && (selectedRequest.category_name === 'annual_leave' || selectedRequest.leave_type === 'annual_leave') ? (
        <AnnualLeaveApprovalModal
          request={selectedRequest}
          onClose={() => setShowApprovalModal(false)}
          onApprove={() => {
            fetchLeaveRequests()
            setShowApprovalModal(false)
          }}
          userRole={userRole}
        />
      ) : showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowApprovalModal(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Review Leave Request</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Staff</p>
                  <p className="font-medium">{selectedRequest.user_name || selectedRequest.user_email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{getCategoryDisplayName(selectedRequest.category_name || selectedRequest.leave_type)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dates</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Days</p>
                  <p className="font-medium">{selectedRequest.days_requested} days</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Reason</p>
                  <p className="font-medium">{selectedRequest.reason || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Approval Progress */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Approval Progress</p>
              <div className="flex items-center justify-between">
                {getApprovalProgress(selectedRequest).map((tier, idx) => (
                  <div key={idx} className="flex-1 flex items-center">
                    <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                      {idx > 0 && (
                        <div className={`h-0.5 w-full mb-2 ${
                          getApprovalProgress(selectedRequest)[idx - 1].status === 'approved' 
                            ? 'bg-green-400' 
                            : 'bg-gray-200'
                        }`}></div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        tier.status === 'approved' ? 'bg-green-100 text-green-700 border-2 border-green-400' :
                        tier.status === 'rejected' ? 'bg-red-100 text-red-700 border-2 border-red-400' :
                        tier.status === 'pending' && tier.tier === selectedRequest.current_approval_tier 
                          ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 animate-pulse' :
                        tier.status === 'pending' ? 'bg-gray-100 text-gray-500 border-2 border-gray-300' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {tier.status === 'approved' ? '✓' : tier.status === 'rejected' ? '✕' : tier.tier}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{tier.label}</p>
                      <p className="text-xs text-gray-400 capitalize">{tier.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Tier Info */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <i className="ri-information-line mr-1"></i>
                Currently awaiting <strong>{getTierLabel(selectedRequest.current_approval_tier || 1)}</strong> approval 
                (Tier {selectedRequest.current_approval_tier || 1} of {selectedRequest.approval_tiers || 1})
              </p>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes for this approval decision..."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTierApproval('rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
              >
                <i className="ri-close-line mr-1"></i>
                Reject
              </button>
              <button
                onClick={() => handleTierApproval('approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                <i className="ri-check-line mr-1"></i>
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annual Leave Form */}
      {showAnnualLeaveForm && (
        <AnnualLeaveForm
          onClose={() => setShowAnnualLeaveForm(false)}
          onSubmit={() => {
            fetchLeaveRequests()
            setShowAnnualLeaveForm(false)
          }}
        />
      )}
    </div>
  )
}

export default LeaveManagement
