import { useAuth } from '../../context/AuthContext'

const StaffDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Pending Reviews', value: '0', icon: 'ri-file-list-3-line', color: 'bg-amber-500' },
    { label: 'Reviewed Today', value: '0', icon: 'ri-checkbox-circle-line', color: 'bg-green-500' },
    { label: 'Total Assigned', value: '0', icon: 'ri-briefcase-line', color: 'bg-blue-500' },
    { label: 'Avg. Review Time', value: '0h', icon: 'ri-time-line', color: 'bg-purple-500' },
  ]

  const pendingSubmissions = []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and manage regulatory submissions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} text-2xl text-white`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Pending Reviews</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No pending submissions</p>
              <p className="text-sm text-gray-500 mt-1">New submissions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{submission.title}</h3>
                      <p className="text-sm text-gray-600">{submission.agency}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <i className="ri-file-check-line text-blue-600 text-xl mb-2"></i>
              <p className="font-medium text-gray-900">Review Queue</p>
              <p className="text-sm text-gray-600">View all pending reviews</p>
            </button>

            <button className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left">
              <i className="ri-bar-chart-line text-emerald-600 text-xl mb-2"></i>
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-sm text-gray-600">Generate activity reports</p>
            </button>

            <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <i className="ri-history-line text-purple-600 text-xl mb-2"></i>
              <p className="font-medium text-gray-900">Review History</p>
              <p className="text-sm text-gray-600">View past reviews</p>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">Reviews This Week</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-1">Reviews This Month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">0%</p>
            <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
