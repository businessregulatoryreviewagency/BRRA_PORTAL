import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [grades, setGrades] = useState([])
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    nrc: '',
    file_number: '',
    contact_phone: '',
    contact_email: '',
    position_id: '',
    department_id: '',
    grade_id: '',
    date_joined: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchDropdownData()
  }, [])

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

  const openProfileModal = async (user) => {
    setSelectedUser(user)
    
    // Fetch existing profile if any
    try {
      const { data } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', user.id)
      
      if (data && data.length > 0) {
        setProfileFormData({
          full_name: data[0].full_name || '',
          nrc: data[0].nrc || '',
          file_number: data[0].file_number || '',
          contact_phone: data[0].contact_phone || '',
          contact_email: data[0].contact_email || user.email || '',
          position_id: data[0].position_id || '',
          department_id: data[0].department_id || '',
          grade_id: data[0].grade_id || '',
          date_joined: data[0].date_joined || '',
          address: data[0].address || '',
          emergency_contact_name: data[0].emergency_contact_name || '',
          emergency_contact_phone: data[0].emergency_contact_phone || ''
        })
      } else {
        setProfileFormData({
          full_name: user.metadata?.full_name || '',
          nrc: '',
          file_number: '',
          contact_phone: user.metadata?.phone || '',
          contact_email: user.email || '',
          position_id: '',
          department_id: '',
          grade_id: '',
          date_joined: '',
          address: '',
          emergency_contact_name: '',
          emergency_contact_phone: ''
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfileFormData({
        full_name: user.metadata?.full_name || '',
        nrc: '',
        file_number: '',
        contact_phone: user.metadata?.phone || '',
        contact_email: user.email || '',
        position_id: '',
        department_id: '',
        grade_id: '',
        date_joined: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      })
    }
    
    setShowProfileModal(true)
  }

  const handleSaveProfile = async () => {
    if (!selectedUser) return
    
    setSavingProfile(true)
    try {
      // Check if profile exists
      const { data: existing } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', selectedUser.id)
      
      if (existing && existing.length > 0) {
        // Update existing profile
        const { error } = await supabase
          .from('staff_profiles')
          .update(profileFormData)
          .eq('user_id', selectedUser.id)
        
        if (error) throw error
        alert('Profile updated successfully!')
      } else {
        // Create new profile
        const { error } = await supabase
          .from('staff_profiles')
          .insert({
            user_id: selectedUser.id,
            ...profileFormData
          })
        
        if (error) throw error
        alert('Profile created successfully!')
      }
      
      setShowProfileModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile: ' + error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'staff': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.metadata?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.metadata?.agency_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const userCount = users.length
  const staffCount = users.filter(u => u.role === 'staff').length
  const adminCount = users.filter(u => u.role === 'admin').length
  const regularUserCount = users.filter(u => u.role === 'user').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions across the portal.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{userCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Regular Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{regularUserCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-3-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Staff Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{staffCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <i className="ri-briefcase-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Administrators</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{adminCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-admin-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or agency..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              All Users ({filteredUsers.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-user-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No users found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
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
                    Phone
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
                {filteredUsers.map((user) => (
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
                      {user.metadata?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <i className="ri-shield-user-line mr-1"></i>
                          Role
                        </button>
                        <button
                          onClick={() => openProfileModal(user)}
                          className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <i className="ri-user-settings-line mr-1"></i>
                          Profile
                        </button>
                      </div>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRoleModal(false)}></div>
          
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

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-user-line text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser?.metadata?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedUser?.email}</p>
                </div>
              </div>
              {selectedUser?.metadata?.agency_name && (
                <p className="text-sm text-gray-500 ml-13">
                  <i className="ri-building-line mr-1"></i>
                  {selectedUser.metadata.agency_name}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  newRole === 'user' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={newRole === 'user'}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">User</p>
                    <p className="text-xs text-gray-500">Can submit and track their own applications</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  newRole === 'staff' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={newRole === 'staff'}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Staff</p>
                    <p className="text-xs text-gray-500">Can review submissions and generate reports</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  newRole === 'admin' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Full access to manage users and system settings</p>
                  </div>
                </label>
              </div>
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
                disabled={newRole === selectedUser?.role}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Staff Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="ri-user-line text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser?.email}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${getRoleBadgeColor(selectedUser?.role)}`}>
                    {selectedUser?.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profileFormData.full_name}
                    onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NRC Number</label>
                  <input
                    type="text"
                    value={profileFormData.nrc}
                    onChange={(e) => setProfileFormData({ ...profileFormData, nrc: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456/78/9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File/Man Number</label>
                  <input
                    type="text"
                    value={profileFormData.file_number}
                    onChange={(e) => setProfileFormData({ ...profileFormData, file_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Man number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileFormData.contact_phone}
                    onChange={(e) => setProfileFormData({ ...profileFormData, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
                  <input
                    type="date"
                    value={profileFormData.date_joined}
                    onChange={(e) => setProfileFormData({ ...profileFormData, date_joined: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={profileFormData.department_id}
                    onChange={(e) => setProfileFormData({ ...profileFormData, department_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={profileFormData.position_id}
                    onChange={(e) => setProfileFormData({ ...profileFormData, position_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={profileFormData.grade_id}
                    onChange={(e) => setProfileFormData({ ...profileFormData, grade_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        Grade {grade.grade_number} - {grade.grade_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={profileFormData.address}
                    onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Residential address"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={profileFormData.emergency_contact_name}
                    onChange={(e) => setProfileFormData({ ...profileFormData, emergency_contact_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={profileFormData.emergency_contact_phone}
                    onChange={(e) => setProfileFormData({ ...profileFormData, emergency_contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
