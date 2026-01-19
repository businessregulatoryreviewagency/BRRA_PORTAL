import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { notifyRIAAssignment } from '../../lib/emailService'

const RIAManagement = () => {
  const { user, userRole } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [submissionToAssign, setSubmissionToAssign] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSector, setFilterSector] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showStageHistoryModal, setShowStageHistoryModal] = useState(false)
  const [stageHistory, setStageHistory] = useState([])

  const stages = [
    { number: 1, name: 'Submission Received', progress: 7 },
    { number: 2, name: 'Officer Assigned', progress: 13 },
    { number: 3, name: 'Initial Review', progress: 20 },
    { number: 4, name: 'Stakeholder Identification', progress: 27 },
    { number: 5, name: 'Economic Impact Analysis', progress: 33 },
    { number: 6, name: 'Social Impact Analysis', progress: 40 },
    { number: 7, name: 'Environmental Impact Analysis', progress: 47 },
    { number: 8, name: 'Mid-point Review', progress: 53 },
    { number: 9, name: 'Report Drafting', progress: 60 },
    { number: 10, name: 'Internal Feedback', progress: 67 },
    { number: 11, name: 'Final Report', progress: 73 },
    { number: 12, name: 'Manager Review', progress: 80 },
    { number: 13, name: 'Executive Approval', progress: 87 },
    { number: 14, name: 'Communication', progress: 93 },
    { number: 15, name: 'Completed & Archived', progress: 100 }
  ]

  const sectors = [
    'Agriculture', 'Education', 'Energy', 'Environment', 'Finance & Banking',
    'Health', 'Information & Technology', 'Manufacturing', 'Mining',
    'Trade & Commerce', 'Tourism', 'Transport', 'Water & Sanitation', 'Other'
  ]

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'staff') {
      fetchSubmissions()
      fetchStaffList()
    }
  }, [userRole])

  const fetchStaffList = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('user_id, full_name, contact_email')
        .order('full_name')

      if (error) throw error
      console.log('Staff list fetched:', data)
      setStaffList(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      alert('Failed to fetch staff list: ' + error.message)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ria_submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      alert('Failed to fetch submissions: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignOfficer = async (submissionId) => {
    try {
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const { error } = await supabase
        .from('ria_submissions')
        .update({
          assigned_officer_id: user.id,
          assigned_officer_name: profile?.full_name || user.email,
          assigned_at: new Date().toISOString(),
          status: 'in_review',
          current_stage: 2,
          stage_name: 'Officer Assigned',
          progress_percentage: 13,
          started_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error

      await supabase
        .from('ria_stage_history')
        .insert([{
          submission_id: submissionId,
          stage_number: 2,
          stage_name: 'Officer Assigned',
          notes: `Assigned to ${profile?.full_name || user.email}`,
          action_by_id: user.id,
          action_by_name: profile?.full_name || user.email
        }])

      const { data: fullSubmission } = await supabase
        .from('ria_submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (fullSubmission) {
        await notifyRIAAssignment(
          user.id,
          fullSubmission,
          profile?.full_name || user.email
        )
      }

      fetchSubmissions()
      alert('Successfully assigned to you!')
    } catch (error) {
      console.error('Error assigning officer:', error)
      alert('Failed to assign: ' + error.message)
    }
  }

  const handleAssignToUser = async () => {
    if (!selectedStaffId || !submissionToAssign) return

    try {
      const selectedStaff = staffList.find(s => s.user_id === selectedStaffId)
      if (!selectedStaff) return

      const { data: assignerProfile } = await supabase
        .from('staff_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const { error } = await supabase
        .from('ria_submissions')
        .update({
          assigned_officer_id: selectedStaffId,
          assigned_officer_name: selectedStaff.full_name,
          assigned_at: new Date().toISOString(),
          status: 'in_review',
          current_stage: 2,
          stage_name: 'Officer Assigned',
          progress_percentage: 13,
          started_at: new Date().toISOString()
        })
        .eq('id', submissionToAssign.id)

      if (error) throw error

      await supabase
        .from('ria_stage_history')
        .insert([{
          submission_id: submissionToAssign.id,
          stage_number: 2,
          stage_name: 'Officer Assigned',
          notes: `Assigned to ${selectedStaff.full_name} by ${assignerProfile?.full_name || user.email}`,
          action_by_id: user.id,
          action_by_name: assignerProfile?.full_name || user.email
        }])

      await notifyRIAAssignment(
        selectedStaffId,
        submissionToAssign,
        assignerProfile?.full_name || user.email
      )

      fetchSubmissions()
      setShowAssignModal(false)
      setSubmissionToAssign(null)
      setSelectedStaffId('')
      alert(`Successfully assigned to ${selectedStaff.full_name}!`)
    } catch (error) {
      console.error('Error assigning to user:', error)
      alert('Failed to assign: ' + error.message)
    }
  }

  const handleUpdateStage = async (submissionId, newStage) => {
    try {
      // Check if user is the assigned officer
      const submission = submissions.find(s => s.id === submissionId)
      if (!submission) {
        alert('Submission not found.')
        return
      }

      if (submission.assigned_officer_id !== user.id) {
        alert('Access Denied: Only the assigned officer can update the stage of this RIA submission.')
        return
      }

      const stage = stages.find(s => s.number === newStage)
      if (!stage) return

      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const updateData = {
        current_stage: newStage,
        stage_name: stage.name,
        progress_percentage: stage.progress
      }

      if (newStage === 15) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('ria_submissions')
        .update(updateData)
        .eq('id', submissionId)

      if (error) throw error

      await supabase
        .from('ria_stage_history')
        .insert([{
          submission_id: submissionId,
          stage_number: newStage,
          stage_name: stage.name,
          action_by_id: user.id,
          action_by_name: profile?.full_name || user.email
        }])

      fetchSubmissions()
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, ...updateData })
      }
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Failed to update stage: ' + error.message)
    }
  }

  const handleUpdateImpacts = async (submissionId, impacts) => {
    try {
      // Check if user is the assigned officer
      const submission = submissions.find(s => s.id === submissionId)
      if (!submission) {
        alert('Submission not found.')
        return
      }

      if (submission.assigned_officer_id !== user.id) {
        alert('Access Denied: Only the assigned officer can update impact analysis.')
        return
      }

      const { error } = await supabase
        .from('ria_submissions')
        .update(impacts)
        .eq('id', submissionId)

      if (error) throw error
      fetchSubmissions()
      alert('Impacts updated successfully!')
    } catch (error) {
      console.error('Error updating impacts:', error)
      alert('Failed to update: ' + error.message)
    }
  }

  const handleImpactDocumentUpload = async (submissionId, file) => {
    if (!file) return

    try {
      // Check if user is the assigned officer
      const submission = submissions.find(s => s.id === submissionId)
      if (!submission) {
        alert('Submission not found.')
        return
      }

      if (submission.assigned_officer_id !== user.id) {
        alert('Access Denied: Only the assigned officer can upload documents.')
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      
      const { error } = await supabase
        .from('ria_submissions')
        .update({
          final_report_path: data.filePath
        })
        .eq('id', submissionId)

      if (error) throw error
      fetchSubmissions()
      alert('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document: ' + error.message)
    }
  }

  const fetchStageHistory = async (submissionId) => {
    try {
      const { data, error } = await supabase
        .from('ria_stage_history')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setStageHistory(data || [])
      setShowStageHistoryModal(true)
    } catch (error) {
      console.error('Error fetching stage history:', error)
      alert('Failed to fetch stage history: ' + error.message)
    }
  }

  const handleSaveFinalReport = async (submissionId, reportFilename) => {
    try {
      const { error } = await supabase
        .from('ria_submissions')
        .update({
          final_report_path: `/uploads/ria/reports/${reportFilename}`
        })
        .eq('id', submissionId)

      if (error) throw error
      fetchSubmissions()
      alert('Report saved successfully!')
    } catch (error) {
      console.error('Error saving report:', error)
      alert('Failed to save report: ' + error.message)
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesSector = filterSector === 'all' || sub.sector === filterSector
    const matchesSearch = sub.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.organization.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSector && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'in_review': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysInfo = (submittedAt) => {
    if (!submittedAt) return { daysElapsed: 0, daysRemaining: 14 }
    const submitted = new Date(submittedAt)
    const now = new Date()
    const daysElapsed = Math.floor((now - submitted) / (1000 * 60 * 60 * 24))
    const daysRemaining = 14 - daysElapsed
    return { daysElapsed, daysRemaining: Math.max(0, daysRemaining) }
  }

  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    )
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'submitted').length,
    inReview: submissions.filter(s => s.status === 'in_review').length,
    completed: submissions.filter(s => s.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RIA Management</h1>
          <p className="text-gray-600">Manage Regulatory Impact Assessment submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-file-list-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Assignment</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inReview}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-search-line text-2xl text-yellow-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-2xl text-emerald-600"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by tracking number, title, or organization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Pending</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Submissions ({filteredSubmissions.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No submissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className={`px-4 py-2 flex items-center justify-between backdrop-blur-sm border-b ${
                    submission.status === 'completed' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        Stage {submission.current_stage}/15: {submission.stage_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        {submission.progress_percentage}% Complete
                      </span>
                      {(() => {
                        const { daysElapsed, daysRemaining } = getDaysInfo(submission.submitted_at)
                        return (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            submission.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            Day {daysElapsed}/14 ({daysRemaining} left)
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  
                  <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {submission.tracking_number}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">{submission.title}</h3>
                      
                      {submission.assigned_officer_name && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                            <i className="ri-user-star-line mr-1.5"></i>
                            Assigned to: {submission.assigned_officer_name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="ri-building-line mr-1"></i>
                          {submission.organization}
                        </span>
                        <span>
                          <i className="ri-folder-line mr-1"></i>
                          {submission.sector}
                        </span>
                        <span>
                          <i className="ri-calendar-line mr-1"></i>
                          {formatDate(submission.submitted_at)}
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center gap-2">
                      {submission.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => handleAssignOfficer(submission.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <i className="ri-user-add-line mr-1"></i>
                            Assign to Me
                          </button>
                          <button
                            onClick={() => {
                              setSubmissionToAssign(submission)
                              setShowAssignModal(true)
                            }}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <i className="ri-team-line mr-1"></i>
                            Assign to User
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => fetchStageHistory(submission.id)}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        <i className="ri-history-line mr-1"></i>
                        View History
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setShowModal(true)
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <i className="ri-eye-line mr-1"></i>
                        View Details
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAssignModal && submissionToAssign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign to User</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSubmissionToAssign(null)
                    setSelectedStaffId('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Submission:</span> {submissionToAssign.tracking_number}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Title:</span> {submissionToAssign.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">-- Select a staff member --</option>
                  {staffList.map((staff) => (
                    <option key={staff.user_id} value={staff.user_id}>
                      {staff.full_name} ({staff.contact_email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSubmissionToAssign(null)
                  setSelectedStaffId('')
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToUser}
                disabled={!selectedStaffId}
                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-check-line mr-1"></i>
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedSubmission.tracking_number}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedSubmission.status)}`}>
                      {selectedSubmission.status.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      Stage {selectedSubmission.current_stage}/15
                    </span>
                    {(() => {
                      const { daysElapsed, daysRemaining } = getDaysInfo(selectedSubmission.submitted_at)
                      return (
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          daysRemaining === 0 ? 'bg-red-100 text-red-700' : 
                          daysRemaining <= 3 ? 'bg-orange-100 text-orange-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          <i className="ri-time-line mr-1"></i>
                          Day {daysElapsed}/14 ({daysRemaining} days left)
                        </span>
                      )
                    })()}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedSubmission.title}</h2>
                  {selectedSubmission.assigned_officer_name && (
                    <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                      <i className="ri-user-star-line mr-1.5"></i>
                      Currently with: {selectedSubmission.assigned_officer_name}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedSubmission(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Submitter Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedSubmission.submitter_name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedSubmission.submitter_email}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedSubmission.submitter_phone || 'N/A'}</p>
                    <p><span className="text-gray-500">Organization:</span> {selectedSubmission.organization}</p>
                    <p><span className="text-gray-500">Type:</span> {selectedSubmission.organization_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Regulation Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Sector:</span> {selectedSubmission.sector}</p>
                    <p><span className="text-gray-500">Type:</span> {selectedSubmission.regulation_type}</p>
                    <p><span className="text-gray-500">Submitted:</span> {formatDate(selectedSubmission.submitted_at)}</p>
                    <p><span className="text-gray-500">Status:</span> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedSubmission.description}
                </p>
              </div>

              {selectedSubmission.document_path && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Submitted Document</h3>
                  <a
                    href={selectedSubmission.document_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <i className="ri-file-pdf-line text-xl"></i>
                    {selectedSubmission.document_filename}
                  </a>
                </div>
              )}

              <div>
                <button
                  onClick={() => fetchStageHistory(selectedSubmission.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <i className="ri-history-line text-lg"></i>
                  Review Stage History
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Stage</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">Current Stage:</span>
                  <span className="font-medium">{selectedSubmission.current_stage} - {selectedSubmission.stage_name}</span>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {stages.map((stage) => (
                    <button
                      key={stage.number}
                      onClick={() => handleUpdateStage(selectedSubmission.id, stage.number)}
                      disabled={selectedSubmission.status === 'completed'}
                      className={`p-2 text-xs rounded-lg transition-colors ${
                        selectedSubmission.current_stage === stage.number
                          ? 'bg-blue-600 text-white'
                          : selectedSubmission.current_stage > stage.number
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {stage.number}. {stage.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSubmission.status === 'in_review' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Impact Analysis Notes</h3>
                  {selectedSubmission.assigned_officer_id !== user.id ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <i className="ri-lock-line mr-1"></i>
                        Only the assigned officer can update impact analysis notes.
                      </p>
                      {selectedSubmission.review_notes && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubmission.review_notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <textarea
                          defaultValue={selectedSubmission.review_notes || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                          rows="6"
                          placeholder="Enter your comprehensive impact analysis notes here. Include economic, social, environmental impacts, and recommendations..."
                          onBlur={(e) => handleUpdateImpacts(selectedSubmission.id, { review_notes: e.target.value })}
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <i className="ri-upload-cloud-line mr-1"></i>
                          Upload Supporting Document
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleImpactDocumentUpload(selectedSubmission.id, e.target.files[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedSubmission.final_report_path && (
                          <a
                            href={selectedSubmission.final_report_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                          >
                            <i className="ri-file-line"></i>
                            View Uploaded Document
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedSubmission.current_stage >= 11 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Final Report</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      defaultValue={selectedSubmission.final_report_path?.split('/').pop() || ''}
                      placeholder="e.g., RIA-2026-12345-report.pdf"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      id="reportFilename"
                    />
                    <button
                      onClick={() => {
                        const filename = document.getElementById('reportFilename').value
                        if (filename) handleSaveFinalReport(selectedSubmission.id, filename)
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                    >
                      Save Report
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Save report to <code className="bg-gray-100 px-1 rounded">public/uploads/ria/reports/</code>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedSubmission(null)
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showStageHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Stage History</h2>
                <button
                  onClick={() => {
                    setShowStageHistoryModal(false)
                    setStageHistory([])
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              {stageHistory.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-history-line text-4xl text-gray-300"></i>
                  <p className="text-gray-600 mt-2">No stage history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stageHistory.map((history, index) => {
                    const nextHistory = stageHistory[index + 1]
                    const duration = nextHistory 
                      ? Math.floor((new Date(nextHistory.created_at) - new Date(history.created_at)) / (1000 * 60 * 60 * 24))
                      : Math.floor((new Date() - new Date(history.created_at)) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={history.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                Stage {history.stage_number}: {history.stage_name}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                duration === 0 ? 'bg-blue-100 text-blue-700' :
                                duration <= 2 ? 'bg-green-100 text-green-700' :
                                duration <= 5 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {duration === 0 ? 'Today' : `${duration} day${duration !== 1 ? 's' : ''}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                <i className="ri-user-line mr-1"></i>
                                {history.action_by_name}
                              </span>
                              <span>
                                <i className="ri-calendar-line mr-1"></i>
                                {formatDate(history.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {history.notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes: </span>
                              {history.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowStageHistoryModal(false)
                  setStageHistory([])
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RIAManagement
