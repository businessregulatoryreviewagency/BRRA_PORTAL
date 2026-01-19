import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('positions')
  const [departments, setDepartments] = useState([])
  const [grades, setGrades] = useState([])
  const [positions, setPositions] = useState([])
  const [staffProfiles, setStaffProfiles] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade_number: '',
    grade_name: '',
    title: '',
    department_id: '',
    grade_id: ''
  })

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

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchDepartments(),
      fetchGrades(),
      fetchPositions(),
      fetchStaffProfiles(),
      fetchAllUsers()
    ])
    setLoading(false)
  }

  const fetchAllUsers = async () => {
    try {
      // Get all users with their roles
      const { data: usersData, error: usersError } = await supabase.rpc('list_all_users')
      if (usersError) throw usersError

      // Get all staff profiles
      const { data: profilesData, error: profilesError } = await supabase.rpc('get_staff_profiles_with_emails')
      if (profilesError) throw profilesError

      // Create a map of user_id to profile for quick lookup
      const profileMap = new Map()
      if (profilesData) {
        profilesData.forEach(profile => {
          profileMap.set(profile.user_id, profile)
        })
      }

      // Merge users with their profiles
      const mergedUsers = (usersData || []).map(user => {
        const profile = profileMap.get(user.id)
        return {
          ...user,
          has_profile: !!profile,
          profile: profile || null,
          full_name: profile?.full_name || null,
          position_title: profile?.position_title || null,
          department_name: profile?.department_name || null,
          grade_number: profile?.grade_number || null,
          contact_phone: profile?.contact_phone || null
        }
      })

      setAllUsers(mergedUsers)
      setFilteredUsers(mergedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      setAllUsers([])
      setFilteredUsers([])
    }
  }

  const handleRoleFilter = (role) => {
    setRoleFilter(role)
    if (role === 'all') {
      setFilteredUsers(allUsers)
    } else {
      setFilteredUsers(allUsers.filter(user => user.role === role))
    }
  }

  const fetchStaffProfiles = async () => {
    try {
      const { data, error } = await supabase.rpc('get_staff_profiles_with_emails')

      if (error) throw error
      
      // Transform data to match expected format
      const profiles = (data || []).map(profile => ({
        ...profile,
        position: profile.position_title ? { title: profile.position_title } : null,
        department: profile.department_name ? { name: profile.department_name } : null,
        grade: profile.grade_number ? { 
          grade_number: profile.grade_number, 
          grade_name: profile.grade_name 
        } : null
      }))
      
      setStaffProfiles(profiles)
    } catch (error) {
      console.error('Error fetching staff profiles:', error)
      setStaffProfiles([])
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('grade_number')

      if (error) throw error
      setGrades(data || [])
    } catch (error) {
      console.error('Error fetching grades:', error)
    }
  }

  const fetchPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select(`
          *,
          department:departments(name),
          grade:grades(grade_number, grade_name)
        `)
        .order('title')

      if (error) throw error
      setPositions(data || [])
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    
    if (type === 'profile') {
      if (item) {
        setProfileFormData({
          full_name: item.full_name || '',
          nrc: item.nrc || '',
          file_number: item.file_number || '',
          contact_phone: item.contact_phone || '',
          contact_email: item.contact_email || item.email || '',
          position_id: item.position_id || '',
          department_id: item.department_id || '',
          grade_id: item.grade_id || '',
          date_joined: item.date_joined || '',
          address: item.address || '',
          emergency_contact_name: item.emergency_contact_name || '',
          emergency_contact_phone: item.emergency_contact_phone || ''
        })
      } else {
        // Reset form for new profile
        setProfileFormData({
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
      }
    } else {
      if (item) {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          grade_number: item.grade_number || '',
          grade_name: item.grade_name || '',
          title: item.title || '',
          department_id: item.department_id || '',
          grade_id: item.grade_id || ''
        })
      } else {
        setFormData({
          name: '',
          description: '',
          grade_number: '',
          grade_name: '',
          title: '',
          department_id: '',
          grade_id: ''
        })
      }
    }
    
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      let result
      
      if (modalType === 'profile') {
        if (editingItem && editingItem.user_id) {
          // Update existing profile
          result = await supabase
            .from('staff_profiles')
            .update(profileFormData)
            .eq('user_id', editingItem.user_id)

          if (result.error) throw result.error
          await fetchStaffProfiles()
          setShowModal(false)
          alert('Staff profile updated successfully!')
        } else if (editingItem && editingItem.id) {
          // Create new profile for user
          result = await supabase
            .from('staff_profiles')
            .insert({ 
              user_id: editingItem.id,
              ...profileFormData 
            })

          if (result.error) throw result.error
          await fetchStaffProfiles()
          await fetchAllUsers()
          setShowModal(false)
          alert('Staff profile created successfully!')
        }
        return
      }
      
      if (modalType === 'department') {
        const payload = {
          name: formData.name,
          description: formData.description
        }
        
        if (editingItem) {
          result = await supabase
            .from('departments')
            .update(payload)
            .eq('id', editingItem.id)
        } else {
          result = await supabase
            .from('departments')
            .insert(payload)
        }
        
        if (result.error) throw result.error
        await fetchDepartments()
      } 
      else if (modalType === 'grade') {
        const payload = {
          grade_number: parseInt(formData.grade_number),
          grade_name: formData.grade_name,
          description: formData.description
        }
        
        if (editingItem) {
          result = await supabase
            .from('grades')
            .update(payload)
            .eq('id', editingItem.id)
        } else {
          result = await supabase
            .from('grades')
            .insert(payload)
        }
        
        if (result.error) throw result.error
        await fetchGrades()
      } 
      else if (modalType === 'position') {
        const payload = {
          title: formData.title,
          department_id: formData.department_id || null,
          grade_id: formData.grade_id || null,
          description: formData.description
        }
        
        if (editingItem) {
          result = await supabase
            .from('positions')
            .update(payload)
            .eq('id', editingItem.id)
        } else {
          result = await supabase
            .from('positions')
            .insert(payload)
        }
        
        if (result.error) throw result.error
        await fetchPositions()
      }

      setShowModal(false)
      setEditingItem(null)
      alert(`${modalType} ${editingItem ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save: ' + error.message)
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const table = type === 'department' ? 'departments' : type === 'grade' ? 'grades' : 'positions'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error

      if (type === 'department') await fetchDepartments()
      else if (type === 'grade') await fetchGrades()
      else await fetchPositions()

      alert(`${type} deleted successfully!`)
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete: ' + error.message)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">Manage positions, departments, and grades</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'positions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-briefcase-line mr-2"></i>
              Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'departments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-building-line mr-2"></i>
              Departments ({departments.length})
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'grades'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-medal-line mr-2"></i>
              Grades ({grades.length})
            </button>
            <button
              onClick={() => setActiveTab('staff-profiles')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'staff-profiles'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-user-settings-line mr-2"></i>
              Staff Profiles ({staffProfiles.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Position Titles</h2>
                <button
                  onClick={() => openModal('position')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Position
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {positions.map((position) => (
                        <tr key={position.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{position.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{position.department?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {position.grade ? `Grade ${position.grade.grade_number}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => openModal('position', position)}
                              className="text-blue-600 hover:text-blue-700 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete('position', position.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
                <button
                  onClick={() => openModal('department')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('department', dept)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete('department', dept.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{dept.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Grades</h2>
                <button
                  onClick={() => openModal('grade')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Grade
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grades.map((grade) => (
                  <div key={grade.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">Grade {grade.grade_number}</h3>
                        <p className="text-sm text-gray-600">{grade.grade_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('grade', grade)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete('grade', grade.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                    {grade.description && (
                      <p className="text-sm text-gray-500">{grade.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Profiles Tab */}
          {activeTab === 'staff-profiles' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Users & Staff Profiles</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-user-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded capitalize">
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.contact_phone || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            {user.has_profile ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                <i className="ri-check-line mr-1"></i>
                                Complete
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                                <i className="ri-alert-line mr-1"></i>
                                Incomplete
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {user.has_profile ? (
                              <button
                                onClick={() => openModal('profile', user.profile)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <i className="ri-edit-line mr-1"></i>
                                Edit Profile
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal('profile', user)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                              >
                                <i className="ri-user-add-line mr-1"></i>
                                Create Profile
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className={`relative bg-white rounded-xl shadow-2xl w-full ${modalType === 'profile' ? 'max-w-3xl' : 'max-w-md'} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'profile' ? 'Staff Profile' : modalType}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {modalType === 'profile' && (
                <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={profileFormData.full_name}
                      onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NRC Number</label>
                    <input
                      type="text"
                      value={profileFormData.nrc}
                      onChange={(e) => setProfileFormData({ ...profileFormData, nrc: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456/78/9"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File/Man Number</label>
                    <input
                      type="text"
                      value={profileFormData.file_number}
                      onChange={(e) => setProfileFormData({ ...profileFormData, file_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileFormData.contact_phone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+260 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileFormData.contact_email}
                      onChange={(e) => setProfileFormData({ ...profileFormData, contact_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Joined</label>
                    <input
                      type="date"
                      value={profileFormData.date_joined}
                      onChange={(e) => setProfileFormData({ ...profileFormData, date_joined: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={profileFormData.address}
                      onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Residential address"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={profileFormData.emergency_contact_name}
                      onChange={(e) => setProfileFormData({ ...profileFormData, emergency_contact_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={profileFormData.emergency_contact_phone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, emergency_contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+260 XXX XXX XXX"
                    />
                  </div>
                </div>
              )}

              {modalType === 'department' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </>
              )}

              {modalType === 'grade' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Number *
                    </label>
                    <input
                      type="number"
                      value={formData.grade_number}
                      onChange={(e) => setFormData({ ...formData, grade_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Name
                    </label>
                    <input
                      type="text"
                      value={formData.grade_name}
                      onChange={(e) => setFormData({ ...formData, grade_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Grade 1 - Executive"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </>
              )}

              {modalType === 'position' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <select
                      value={formData.grade_id}
                      onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement
