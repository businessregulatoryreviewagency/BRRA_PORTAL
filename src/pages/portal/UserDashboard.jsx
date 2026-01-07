import { useAuth } from '../../context/AuthContext'

const UserDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Submissions', value: '0', icon: 'ri-file-list-3-line', color: 'bg-blue-500' },
    { label: 'Pending Review', value: '0', icon: 'ri-time-line', color: 'bg-amber-500' },
    { label: 'Approved', value: '0', icon: 'ri-checkbox-circle-line', color: 'bg-green-500' },
    { label: 'Documents', value: '0', icon: 'ri-folder-line', color: 'bg-purple-500' },
  ]

  const recentActivity = [
    { id: 1, action: 'Welcome to BRRA Portal', date: new Date().toLocaleDateString(), type: 'info' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your submissions today.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <div className="flex items-center">
                <i className="ri-send-plane-line text-blue-600 text-xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Submit New Framework</p>
                  <p className="text-sm text-gray-600">Create a new RIA submission</p>
                </div>
              </div>
              <i className="ri-arrow-right-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left">
              <div className="flex items-center">
                <i className="ri-search-line text-emerald-600 text-xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Track Submission</p>
                  <p className="text-sm text-gray-600">Check status of your submissions</p>
                </div>
              </div>
              <i className="ri-arrow-right-line text-gray-400"></i>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <div className="flex items-center">
                <i className="ri-download-line text-purple-600 text-xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Download Forms</p>
                  <p className="text-sm text-gray-600">Access official forms and templates</p>
                </div>
              </div>
              <i className="ri-arrow-right-line text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gradient-to-br from-blue-900 to-emerald-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
            <p className="text-blue-100">Our support team is here to assist you with any questions.</p>
          </div>
          <button className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
