import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const RIAReports = () => {
  const { userRole } = useAuth()
  const [activeReport, setActiveReport] = useState('live-status')
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [stageHistory, setStageHistory] = useState([])
  const [staffList, setStaffList] = useState([])
  const [comments, setComments] = useState([])

  const stages = [
    { number: 1, name: 'Submission Received', expectedDays: 1 },
    { number: 2, name: 'Officer Assigned', expectedDays: 1 },
    { number: 3, name: 'Initial Review', expectedDays: 2 },
    { number: 4, name: 'Stakeholder Identification', expectedDays: 2 },
    { number: 5, name: 'Economic Impact Analysis', expectedDays: 3 },
    { number: 6, name: 'Social Impact Analysis', expectedDays: 3 },
    { number: 7, name: 'Environmental Impact Analysis', expectedDays: 3 },
    { number: 8, name: 'Mid-point Review', expectedDays: 1 },
    { number: 9, name: 'Report Drafting', expectedDays: 3 },
    { number: 10, name: 'Internal Feedback', expectedDays: 3 },
    { number: 11, name: 'Final Report', expectedDays: 1 },
    { number: 12, name: 'Manager Review', expectedDays: 1 },
    { number: 13, name: 'Executive Approval', expectedDays: 1 },
    { number: 14, name: 'Communication', expectedDays: 2 },
    { number: 15, name: 'Completed & Archived', expectedDays: 0 }
  ]

  const reports = [
    { id: 'live-status', name: 'Live RIA Status', icon: 'ri-dashboard-line', color: 'blue' },
    { id: 'overdue', name: 'Overdue RIAs', icon: 'ri-alarm-warning-line', color: 'red' },
    { id: 'stage-duration', name: 'Stage Duration', icon: 'ri-time-line', color: 'purple' },
    { id: 'stuck-stage', name: 'Stuck-in-Stage', icon: 'ri-error-warning-line', color: 'orange' },
    { id: 'officer-workload', name: 'Officer Workload', icon: 'ri-team-line', color: 'green' },
    { id: 'bottleneck', name: 'Bottleneck Heatmap', icon: 'ri-fire-line', color: 'yellow' },
    { id: 'audit', name: 'Audit Trail', icon: 'ri-history-line', color: 'indigo' },
    { id: 'turnaround', name: 'Turnaround Time', icon: 'ri-speed-line', color: 'teal' }
  ]

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'staff') {
      fetchData()
    }
  }, [userRole])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [submissionsRes, historyRes, staffRes, commentsRes] = await Promise.all([
        supabase.from('ria_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('ria_stage_history').select('*').order('created_at', { ascending: true }),
        supabase.from('staff_profiles').select('user_id, full_name, contact_email').order('full_name'),
        supabase.from('ria_comments').select('*').order('created_at', { ascending: true })
      ])

      if (submissionsRes.data) setSubmissions(submissionsRes.data)
      if (historyRes.data) setStageHistory(historyRes.data)
      if (staffRes.data) setStaffList(staffRes.data)
      if (commentsRes.data) setComments(commentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysElapsed = (submittedDate) => {
    return Math.floor((new Date() - new Date(submittedDate)) / (1000 * 60 * 60 * 24))
  }

  const calculateDaysRemaining = (submittedDate) => {
    const elapsed = calculateDaysElapsed(submittedDate)
    return Math.max(0, 14 - elapsed)
  }

  const isOverdue = (submittedDate, status) => {
    return status !== 'completed' && calculateDaysElapsed(submittedDate) > 14
  }

  const getStageEntryDate = (submissionId, stageNumber) => {
    const entry = stageHistory.find(h => h.submission_id === submissionId && h.stage_number === stageNumber)
    return entry?.created_at
  }

  const getDaysInCurrentStage = (submission) => {
    const entryDate = getStageEntryDate(submission.id, submission.current_stage)
    if (!entryDate) return 0
    return Math.floor((new Date() - new Date(entryDate)) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return
    const csv = data.map(row => Object.values(row).join(',')).join('\n')
    const header = Object.keys(data[0]).join(',')
    const blob = new Blob([header + '\n' + csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const renderReport = () => {
    switch (activeReport) {
      case 'live-status': return <LiveStatusReport />
      case 'overdue': return <OverdueReport />
      case 'stage-duration': return <StageDurationReport />
      case 'stuck-stage': return <StuckInStageReport />
      case 'officer-workload': return <OfficerWorkloadReport />
      case 'bottleneck': return <BottleneckHeatmapReport />
      case 'audit': return <AuditTrailReport />
      case 'turnaround': return <TurnaroundTimeReport />
      default: return <LiveStatusReport />
    }
  }

  const LiveStatusReport = () => {
    const data = submissions.map(s => ({
      trackingNumber: s.tracking_number,
      title: s.title,
      currentStage: `${s.current_stage}/15`,
      status: s.status,
      daysElapsed: calculateDaysElapsed(s.submitted_at),
      daysRemaining: calculateDaysRemaining(s.submitted_at),
      assignedTo: s.assigned_officer_name || 'Unassigned'
    }))

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Live RIA Status Report</h2>
          <button
            onClick={() => exportToCSV(data, 'live-ria-status.csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total RIAs</p>
            <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">On Track</p>
            <p className="text-2xl font-bold text-green-600">
              {submissions.filter(s => !isOverdue(s.submitted_at, s.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">
              {submissions.filter(s => isOverdue(s.submitted_at, s.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {submissions.filter(s => s.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map(s => {
                const daysElapsed = calculateDaysElapsed(s.submitted_at)
                const daysRemaining = calculateDaysRemaining(s.submitted_at)
                const overdue = isOverdue(s.submitted_at, s.status)

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{s.tracking_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{s.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{s.current_stage}/15</span>
                      <br />
                      <span className="text-xs text-gray-500">{s.stage_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.status === 'completed' ? 'bg-green-100 text-green-800' :
                        s.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{daysElapsed}</span>/14
                      <br />
                      <span className="text-xs text-gray-500">{daysRemaining} left</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        overdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {overdue ? `OVERDUE` : 'On Track'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.assigned_officer_name || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${s.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{s.progress_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const OverdueReport = () => {
    const overdueRIAs = submissions.filter(s => isOverdue(s.submitted_at, s.status))

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Overdue RIA Report</h2>
          <button
            onClick={() => exportToCSV(overdueRIAs.map(s => ({
              trackingNumber: s.tracking_number,
              title: s.title,
              currentStage: s.stage_name,
              daysOverdue: calculateDaysElapsed(s.submitted_at) - 14,
              assignedTo: s.assigned_officer_name || 'Unassigned'
            })), 'overdue-rias.csv')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <i className="ri-alarm-warning-line text-3xl text-red-600 mr-4"></i>
            <div>
              <h3 className="text-lg font-bold text-red-900">{overdueRIAs.length} RIAs Overdue</h3>
              <p className="text-sm text-red-700">These submissions have exceeded the 14-day SLA</p>
            </div>
          </div>
        </div>

        {overdueRIAs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="ri-checkbox-circle-line text-6xl text-green-500"></i>
            <p className="text-gray-600 mt-4 text-lg">No overdue RIAs! All submissions are on track.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueRIAs.map(s => {
                  const daysOverdue = calculateDaysElapsed(s.submitted_at) - 14

                  return (
                    <tr key={s.id} className="hover:bg-red-50">
                      <td className="px-4 py-3 text-sm font-mono">{s.tracking_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{s.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">Stage {s.current_stage}</span>
                        <br />
                        <span className="text-xs text-gray-500">{s.stage_name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          daysOverdue > 7 ? 'bg-red-600 text-white' :
                          daysOverdue > 3 ? 'bg-red-500 text-white' :
                          'bg-red-400 text-white'
                        }`}>
                          {daysOverdue} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {s.assigned_officer_name || <span className="text-red-600 font-medium">⚠️ Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(s.submitted_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const StageDurationReport = () => {
    const stageDurations = stages.map(stage => {
      const stageEntries = stageHistory.filter(h => h.stage_number === stage.number)
      const durations = []

      stageEntries.forEach(entry => {
        const submission = submissions.find(s => s.id === entry.submission_id)
        if (!submission) return

        const nextStageEntry = stageHistory.find(h => 
          h.submission_id === entry.submission_id && 
          h.stage_number === stage.number + 1
        )

        const endDate = nextStageEntry ? new Date(nextStageEntry.created_at) : 
                       (submission.current_stage === stage.number ? new Date() : null)

        if (endDate) {
          const days = Math.floor((endDate - new Date(entry.created_at)) / (1000 * 60 * 60 * 24))
          durations.push(days)
        }
      })

      const avgDuration = durations.length > 0 
        ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1)
        : 0

      const minDuration = durations.length > 0 ? Math.min(...durations) : 0
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 0
      const exceedingExpected = durations.filter(d => d > stage.expectedDays).length
      const percentExceeding = durations.length > 0 
        ? ((exceedingExpected / durations.length) * 100).toFixed(0)
        : 0

      return {
        stage: stage.number,
        name: stage.name,
        expectedDays: stage.expectedDays,
        avgDuration: parseFloat(avgDuration),
        minDuration,
        maxDuration,
        totalRIAs: durations.length,
        percentExceeding: parseInt(percentExceeding)
      }
    })

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Stage Duration Breakdown Report</h2>
          <button
            onClick={() => exportToCSV(stageDurations, 'stage-duration.csv')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min / Max</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total RIAs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Exceeding</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stageDurations.map(s => {
                const isOverExpected = s.avgDuration > s.expectedDays
                const variance = s.avgDuration - s.expectedDays

                return (
                  <tr key={s.stage} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">Stage {s.stage}</span>
                      <br />
                      <span className="text-xs text-gray-500">{s.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.expectedDays} days</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-bold ${isOverExpected ? 'text-red-600' : 'text-green-600'}`}>
                        {s.avgDuration} days
                      </span>
                      {isOverExpected && (
                        <span className="text-xs text-red-500 ml-1">(+{variance.toFixed(1)})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.minDuration} / {s.maxDuration} days
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.totalRIAs}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.percentExceeding > 50 ? 'bg-red-100 text-red-800' :
                        s.percentExceeding > 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {s.percentExceeding}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const StuckInStageReport = () => {
    const STUCK_THRESHOLD = 3
    const stuckRIAs = submissions
      .filter(s => s.status !== 'completed')
      .map(s => ({
        ...s,
        daysInStage: getDaysInCurrentStage(s)
      }))
      .filter(s => s.daysInStage > STUCK_THRESHOLD)
      .sort((a, b) => b.daysInStage - a.daysInStage)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">RIA Stuck-in-Stage Report</h2>
          <button
            onClick={() => exportToCSV(stuckRIAs.map(s => ({
              trackingNumber: s.tracking_number,
              title: s.title,
              currentStage: s.stage_name,
              daysInStage: s.daysInStage,
              assignedTo: s.assigned_officer_name || 'Unassigned'
            })), 'stuck-in-stage.csv')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center">
            <i className="ri-error-warning-line text-3xl text-orange-600 mr-4"></i>
            <div>
              <h3 className="text-lg font-bold text-orange-900">{stuckRIAs.length} RIAs Stuck in Stage</h3>
              <p className="text-sm text-orange-700">No progress for more than {STUCK_THRESHOLD} days</p>
            </div>
          </div>
        </div>

        {stuckRIAs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="ri-speed-line text-6xl text-green-500"></i>
            <p className="text-gray-600 mt-4 text-lg">All RIAs are progressing smoothly!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days in Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stuckRIAs.map(s => (
                  <tr key={s.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 text-sm font-mono">{s.tracking_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">Stage {s.current_stage}</span>
                      <br />
                      <span className="text-xs text-gray-500">{s.stage_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        s.daysInStage > 7 ? 'bg-red-600 text-white' :
                        s.daysInStage > 5 ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {s.daysInStage} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {s.assigned_officer_name || <span className="text-red-600 font-medium">⚠️ Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {s.daysInStage > 7 ? (
                        <span className="text-red-600 font-bold">🔴 Critical</span>
                      ) : s.daysInStage > 5 ? (
                        <span className="text-orange-600 font-bold">🟠 High</span>
                      ) : (
                        <span className="text-yellow-600 font-bold">🟡 Medium</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const OfficerWorkloadReport = () => {
    const workloadData = staffList.map(staff => {
      const assignedRIAs = submissions.filter(s => s.assigned_officer_id === staff.user_id)
      const activeRIAs = assignedRIAs.filter(s => s.status !== 'completed')
      const completedRIAs = assignedRIAs.filter(s => s.status === 'completed')

      const completedWithDurations = completedRIAs.map(ria => {
        if (!ria.submitted_at || !ria.completed_at) return null
        return Math.floor((new Date(ria.completed_at) - new Date(ria.submitted_at)) / (1000 * 60 * 60 * 24))
      }).filter(d => d !== null)

      const avgHandlingTime = completedWithDurations.length > 0
        ? (completedWithDurations.reduce((a, b) => a + b, 0) / completedWithDurations.length).toFixed(1)
        : 0

      return {
        name: staff.full_name,
        email: staff.contact_email,
        totalAssigned: assignedRIAs.length,
        active: activeRIAs.length,
        completed: completedRIAs.length,
        avgHandlingTime: parseFloat(avgHandlingTime)
      }
    }).filter(w => w.totalAssigned > 0)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Officer Workload Report</h2>
          <button
            onClick={() => exportToCSV(workloadData, 'officer-workload.csv')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Officers</p>
            <p className="text-2xl font-bold text-gray-900">{workloadData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Avg Active Cases</p>
            <p className="text-2xl font-bold text-yellow-600">
              {workloadData.length > 0 
                ? (workloadData.reduce((a, b) => a + b.active, 0) / workloadData.length).toFixed(1)
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Avg Handling Time</p>
            <p className="text-2xl font-bold text-green-600">
              {workloadData.length > 0 
                ? (workloadData.reduce((a, b) => a + b.avgHandlingTime, 0) / workloadData.length).toFixed(1)
                : 0} days
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workloadData.map((officer, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-gray-900">{officer.name}</span>
                    <br />
                    <span className="text-xs text-gray-500">{officer.email}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{officer.totalAssigned}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      officer.active > 5 ? 'bg-red-100 text-red-800' :
                      officer.active > 3 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {officer.active}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">{officer.completed}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${
                      officer.avgHandlingTime > 14 ? 'text-red-600' :
                      officer.avgHandlingTime > 10 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {officer.avgHandlingTime} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {officer.active > 5 ? (
                      <span className="text-red-600 font-bold">🔴 Overloaded</span>
                    ) : officer.active > 3 ? (
                      <span className="text-yellow-600 font-bold">🟡 Busy</span>
                    ) : (
                      <span className="text-green-600 font-bold">🟢 Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const BottleneckHeatmapReport = () => {
    const bottleneckData = stages.map(stage => {
      const stageEntries = stageHistory.filter(h => h.stage_number === stage.number)
      const durations = []

      stageEntries.forEach(entry => {
        const submission = submissions.find(s => s.id === entry.submission_id)
        if (!submission) return

        const nextStageEntry = stageHistory.find(h => 
          h.submission_id === entry.submission_id && 
          h.stage_number === stage.number + 1
        )

        const endDate = nextStageEntry ? new Date(nextStageEntry.created_at) : 
                       (submission.current_stage === stage.number ? new Date() : null)

        if (endDate) {
          const days = Math.floor((endDate - new Date(entry.created_at)) / (1000 * 60 * 60 * 24))
          durations.push(days)
        }
      })

      const avgDuration = durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0

      const variance = avgDuration - stage.expectedDays
      const severity = variance > 3 ? 'critical' : variance > 1 ? 'high' : variance > 0 ? 'medium' : 'low'

      return {
        stage: stage.number,
        name: stage.name,
        expectedDays: stage.expectedDays,
        avgDuration: avgDuration.toFixed(1),
        variance: variance.toFixed(1),
        severity,
        totalRIAs: durations.length
      }
    })

    const getHeatColor = (severity) => {
      switch (severity) {
        case 'critical': return 'bg-red-600 text-white'
        case 'high': return 'bg-orange-500 text-white'
        case 'medium': return 'bg-yellow-400 text-gray-900'
        default: return 'bg-green-500 text-white'
      }
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Stage Bottleneck Heatmap</h2>
          <button
            onClick={() => exportToCSV(bottleneckData, 'bottleneck-heatmap.csv')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center">
            <i className="ri-fire-line text-3xl text-yellow-600 mr-4"></i>
            <div>
              <h3 className="text-lg font-bold text-yellow-900">Bottleneck Analysis</h3>
              <p className="text-sm text-yellow-700">Red/Orange stages indicate significant delays</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {bottleneckData.map(stage => (
              <div
                key={stage.stage}
                className={`${getHeatColor(stage.severity)} rounded-lg p-4 transition-transform hover:scale-105 cursor-pointer`}
              >
                <div className="text-center">
                  <p className="text-xs opacity-80 mb-1">Stage {stage.stage}</p>
                  <p className="font-bold text-sm mb-2">{stage.name}</p>
                  <div className="border-t border-white/20 pt-2 mt-2">
                    <p className="text-xs opacity-80">Avg: {stage.avgDuration}d</p>
                    <p className="text-xs opacity-80">Expected: {stage.expectedDays}d</p>
                    {parseFloat(stage.variance) > 0 && (
                      <p className="text-xs font-bold mt-1">+{stage.variance}d</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Minor Delay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Significant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const AuditTrailReport = () => {
    const [selectedRIA, setSelectedRIA] = useState('')
    const selectedSubmission = submissions.find(s => s.id === selectedRIA)
    const selectedHistory = stageHistory.filter(h => h.submission_id === selectedRIA)
    const selectedComments = comments.filter(c => c.submission_id === selectedRIA)

    const buildCompleteTimeline = () => {
      if (!selectedSubmission) return []

      const timeline = []
      const currentStage = selectedSubmission.current_stage

      // Add all 15 stages to timeline
      stages.forEach(stage => {
        const stageHistoryEntry = selectedHistory.find(h => h.stage_number === stage.number)
        const isDone = stage.number <= currentStage
        const isCurrent = stage.number === currentStage
        
        timeline.push({
          type: 'stage',
          stageNumber: stage.number,
          date: stageHistoryEntry?.created_at || null,
          title: `Stage ${stage.number}: ${stage.name}`,
          actor: stageHistoryEntry?.action_by_name || (isDone ? 'System' : 'Pending'),
          details: stageHistoryEntry?.notes || (isDone ? 'Stage completed' : 'Awaiting completion'),
          icon: isDone ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line',
          color: isDone ? 'green' : 'gray',
          status: isCurrent ? 'current' : (isDone ? 'done' : 'pending'),
          isDone: isDone,
          isCurrent: isCurrent
        })
      })

      // Add assignment event if exists
      if (selectedSubmission.assigned_at) {
        timeline.push({
          type: 'assignment',
          date: selectedSubmission.assigned_at,
          title: 'Officer Assigned',
          actor: 'System',
          details: `Assigned to ${selectedSubmission.assigned_officer_name}`,
          icon: 'ri-user-add-line',
          color: 'blue',
          status: 'done',
          isDone: true
        })
      }

      // Add comments
      selectedComments.forEach(comment => {
        timeline.push({
          type: 'comment',
          date: comment.created_at,
          title: comment.is_internal ? 'Internal Comment' : 'Comment',
          actor: comment.created_by_name || 'Unknown',
          details: comment.comment,
          icon: 'ri-chat-3-line',
          color: 'purple',
          status: 'done',
          isDone: true
        })
      })

      // Add documents
      if (selectedSubmission.document_filename) {
        timeline.push({
          type: 'document',
          date: selectedSubmission.submitted_at,
          title: 'Initial Document Uploaded',
          actor: selectedSubmission.submitter_name,
          details: selectedSubmission.document_filename,
          icon: 'ri-file-text-line',
          color: 'orange',
          status: 'done',
          isDone: true
        })
      }

      if (selectedSubmission.supporting_docs && Array.isArray(selectedSubmission.supporting_docs) && selectedSubmission.supporting_docs.length > 0) {
        selectedSubmission.supporting_docs.forEach((doc, idx) => {
          timeline.push({
            type: 'document',
            date: selectedSubmission.submitted_at,
            title: 'Supporting Document',
            actor: selectedSubmission.submitter_name,
            details: doc.filename || `Document ${idx + 1}`,
            icon: 'ri-attachment-line',
            color: 'orange',
            status: 'done',
            isDone: true
          })
        })
      }

      if (selectedSubmission.final_report_path) {
        timeline.push({
          type: 'document',
          date: selectedSubmission.completed_at || selectedSubmission.updated_at,
          title: 'Final Report Uploaded',
          actor: selectedSubmission.assigned_officer_name || 'Staff',
          details: 'Final RIA report completed',
          icon: 'ri-file-check-line',
          color: 'green',
          status: 'done',
          isDone: true
        })
      }

      // Sort: stages by number first, then other events by date
      return timeline.sort((a, b) => {
        if (a.type === 'stage' && b.type === 'stage') {
          return a.stageNumber - b.stageNumber
        }
        if (a.type === 'stage') return -1
        if (b.type === 'stage') return 1
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date) - new Date(b.date)
      })
    }

    const completeTimeline = buildCompleteTimeline()

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">RIA Audit Trail Report</h2>
          {completeTimeline.length > 0 && (
            <button
              onClick={() => exportToCSV(completeTimeline.map(t => ({
                type: t.type,
                date: formatDate(t.date),
                time: new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                title: t.title,
                actor: t.actor,
                details: t.details
              })), `audit-trail-${selectedSubmission?.tracking_number}.csv`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <i className="ri-download-line mr-2"></i>Export CSV
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select RIA Submission</label>
          <select
            value={selectedRIA}
            onChange={(e) => setSelectedRIA(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select a submission --</option>
            {submissions.map(s => (
              <option key={s.id} value={s.id}>
                {s.tracking_number} - {s.title}
              </option>
            ))}
          </select>
        </div>

        {selectedSubmission && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Submission Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Tracking #:</span> <span className="font-mono">{selectedSubmission.tracking_number}</span></p>
                  <p><span className="text-gray-500">Title:</span> {selectedSubmission.title}</p>
                  <p><span className="text-gray-500">Organization:</span> {selectedSubmission.organization}</p>
                  <p><span className="text-gray-500">Submitted:</span> {formatDate(selectedSubmission.submitted_at)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Stage:</span> {selectedSubmission.current_stage}/15 - {selectedSubmission.stage_name}</p>
                  <p><span className="text-gray-500">Status:</span> <span className="capitalize">{selectedSubmission.status.replace('_', ' ')}</span></p>
                  <p><span className="text-gray-500">Progress:</span> {selectedSubmission.progress_percentage}%</p>
                  <p><span className="text-gray-500">Assigned:</span> {selectedSubmission.assigned_officer_name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Complete Activity Timeline</h3>
              <span className="text-sm text-gray-500">{completeTimeline.length} events</span>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-3">
                {completeTimeline.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activity history available</p>
                ) : (
                  completeTimeline.map((event, index) => {
                    const nextEvent = completeTimeline[index + 1]
                    const duration = event.date && nextEvent?.date
                      ? Math.floor((new Date(nextEvent.date) - new Date(event.date)) / (1000 * 60 * 60 * 24))
                      : null

                    // Determine styling based on status
                    let iconBgColor, iconBorderColor, iconTextColor, cardOpacity, statusBadge
                    
                    if (event.status === 'done') {
                      iconBgColor = 'bg-green-100'
                      iconBorderColor = 'border-green-500'
                      iconTextColor = 'text-green-600'
                      cardOpacity = 'opacity-100'
                      statusBadge = { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' }
                    } else if (event.status === 'current') {
                      iconBgColor = 'bg-blue-100'
                      iconBorderColor = 'border-blue-500'
                      iconTextColor = 'text-blue-600'
                      cardOpacity = 'opacity-100'
                      statusBadge = { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Current' }
                    } else {
                      iconBgColor = 'bg-gray-100'
                      iconBorderColor = 'border-gray-300'
                      iconTextColor = 'text-gray-400'
                      cardOpacity = 'opacity-60'
                      statusBadge = { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' }
                    }

                    return (
                      <div key={index} className={`relative pl-14 ${cardOpacity}`}>
                        <div className={`absolute left-3 w-6 h-6 rounded-full ${iconBgColor} border-2 ${iconBorderColor} flex items-center justify-center`}>
                          <i className={`${event.icon} ${iconTextColor} text-sm`}></i>
                        </div>
                        
                        <div className={`border rounded-lg p-4 transition-shadow ${
                          event.status === 'pending' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:shadow-md'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {event.type === 'stage' && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusBadge.bg} ${statusBadge.text} uppercase`}>
                                    {statusBadge.label}
                                  </span>
                                )}
                                {event.type !== 'stage' && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    event.type === 'assignment' ? 'bg-blue-100 text-blue-700' :
                                    event.type === 'comment' ? 'bg-purple-100 text-purple-700' :
                                    event.type === 'document' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  } uppercase`}>
                                    {event.type}
                                  </span>
                                )}
                                <h4 className={`font-semibold ${event.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {event.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                <span>
                                  <i className="ri-user-line mr-1"></i>
                                  {event.actor}
                                </span>
                                {event.date && (
                                  <>
                                    <span>
                                      <i className="ri-calendar-line mr-1"></i>
                                      {formatDate(event.date)}
                                    </span>
                                    <span>
                                      <i className="ri-time-line mr-1"></i>
                                      {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                )}
                                {duration !== null && duration > 0 && event.status === 'done' && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    duration <= 2 ? 'bg-green-100 text-green-700' :
                                    duration <= 5 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {duration} day{duration !== 1 ? 's' : ''} duration
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${event.status === 'pending' ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                                {event.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const TurnaroundTimeReport = () => {
    const completedRIAs = submissions.filter(s => s.status === 'completed' && s.submitted_at && s.completed_at)
    
    const turnaroundData = completedRIAs.map(s => {
      const days = Math.floor((new Date(s.completed_at) - new Date(s.submitted_at)) / (1000 * 60 * 60 * 24))
      return {
        trackingNumber: s.tracking_number,
        title: s.title,
        submittedDate: formatDate(s.submitted_at),
        completedDate: formatDate(s.completed_at),
        totalDays: days,
        slaCompliance: days <= 14 ? 'Met' : 'Exceeded',
        variance: days - 14
      }
    }).sort((a, b) => b.totalDays - a.totalDays)

    const avgTurnaround = turnaroundData.length > 0
      ? (turnaroundData.reduce((a, b) => a + b.totalDays, 0) / turnaroundData.length).toFixed(1)
      : 0

    const metSLA = turnaroundData.filter(r => r.totalDays <= 14).length
    const exceededSLA = turnaroundData.filter(r => r.totalDays > 14).length
    const slaComplianceRate = turnaroundData.length > 0
      ? ((metSLA / turnaroundData.length) * 100).toFixed(0)
      : 0

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">End-to-End Turnaround Time Report</h2>
          <button
            onClick={() => exportToCSV(turnaroundData, 'turnaround-time.csv')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
          >
            <i className="ri-download-line mr-2"></i>Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
            <p className="text-sm text-gray-600">Completed RIAs</p>
            <p className="text-2xl font-bold text-gray-900">{completedRIAs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Avg Turnaround</p>
            <p className="text-2xl font-bold text-blue-600">{avgTurnaround} days</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">SLA Compliance</p>
            <p className="text-2xl font-bold text-green-600">{slaComplianceRate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Exceeded SLA</p>
            <p className="text-2xl font-bold text-red-600">{exceededSLA}</p>
          </div>
        </div>

        {turnaroundData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="ri-inbox-line text-6xl text-gray-300"></i>
            <p className="text-gray-600 mt-4 text-lg">No completed RIAs yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turnaroundData.map((ria, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{ria.trackingNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{ria.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ria.submittedDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ria.completedDate}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-bold ${
                        ria.totalDays > 14 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {ria.totalDays} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ria.slaCompliance === 'Met' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ria.slaCompliance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${
                        ria.variance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {ria.variance > 0 ? '+' : ''}{ria.variance} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RIA Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive tracking and performance reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`p-3 rounded-lg text-center transition-all ${
                activeReport === report.id
                  ? `bg-${report.color}-100 border-2 border-${report.color}-500 text-${report.color}-700`
                  : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className={`${report.icon} text-2xl mb-1`}></i>
              <p className="text-xs font-medium">{report.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        {renderReport()}
      </div>
    </div>
  )
}

export default RIAReports
