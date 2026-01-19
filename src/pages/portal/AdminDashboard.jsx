import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState('')

  const stats = [
    { label: 'Total Users', value: '0', icon: 'ri-user-line', color: 'bg-blue-500' },
    { label: 'Staff Members', value: '0', icon: 'ri-briefcase-line', color: 'bg-emerald-500' },
    { label: 'Admins', value: '0', icon: 'ri-admin-line', color: 'bg-purple-500' },
    { label: 'Active Today', value: '0', icon: 'ri-pulse-line', color: 'bg-amber-500' },
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.rpc('get_all_users_with_roles')
      
      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      const usersWithRoles = data.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        created_at: user.created_at,
        metadata: {
          full_name: user.full_name,
          agency_name: user.agency_name,
          phone: user.phone
        }
      }))

      setUsers(usersWithRoles)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to fetch users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          {
            user_id: selectedUser.id,
            role: newRole,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id'
          }
        )

      if (error) throw error

      await fetchUsers()
      setShowRoleModal(false)
      setSelectedUser(null)
      setNewRole('')
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update user role: ' + error.message)
    }
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'staff': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const userCount = users.length
  const staffCount = users.filter(u => u.role === 'staff').length
  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and system settings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          let value = stat.value
          if (stat.label === 'Total Users') value = userCount
          if (stat.label === 'Staff Members') value = staffCount
          if (stat.label === 'Admins') value = adminCount

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-2xl text-white`}></i>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-user-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <i className="ri-user-line text-blue-600"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.metadata?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.metadata?.agency_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRoleModal(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Change User Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">User</p>
              <p className="font-medium text-gray-900">{selectedUser?.email}</p>
              <p className="text-sm text-gray-500">{selectedUser?.metadata?.agency_name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {newRole === 'user' && 'Regular users can submit and track their own applications.'}
                {newRole === 'staff' && 'Staff members can review submissions and generate reports.'}
                {newRole === 'admin' && 'Admins have full access to manage users and system settings.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
