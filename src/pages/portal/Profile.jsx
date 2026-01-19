import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState([])
  const [grades, setGrades] = useState([])
  const [positions, setPositions] = useState([])
  const [profile, setProfile] = useState({
    full_name: '',
    nrc: '',
    file_number: '',
    contact_phone: '',
    contact_email: '',
    position_id: '',
    department_id: '',
    grade_id: '',
    date_joined: '',
    employment_status: 'active',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch departments, grades, and positions
      const [deptResult, gradeResult, posResult] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('grades').select('*').order('grade_number'),
        supabase.from('positions').select('*, department:departments(name), grade:grades(grade_number)').order('title')
      ])

      setDepartments(deptResult.data || [])
      setGrades(gradeResult.data || [])
      setPositions(posResult.data || [])

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', user.id)

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else if (profileData && profileData.length > 0) {
        const profile = profileData[0]
        setProfile({
          full_name: profile.full_name || '',
          nrc: profile.nrc || '',
          file_number: profile.file_number || '',
          contact_phone: profile.contact_phone || '',
          contact_email: profile.contact_email || user.email,
          position_id: profile.position_id || '',
          department_id: profile.department_id || '',
          grade_id: profile.grade_id || '',
          date_joined: profile.date_joined || '',
          employment_status: profile.employment_status || 'active',
          address: profile.address || '',
          emergency_contact_name: profile.emergency_contact_name || '',
          emergency_contact_phone: profile.emergency_contact_phone || ''
        })
      } else {
        // Set default email if no profile exists
        setProfile(prev => ({ ...prev, contact_email: user.email }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: existingProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', user.id)

      const payload = {
        user_id: user.id,
        ...profile
      }

      let result
      if (existingProfile && existingProfile.length > 0) {
        result = await supabase
          .from('staff_profiles')
          .update(payload)
          .eq('user_id', user.id)
      } else {
        result = await supabase
          .from('staff_profiles')
          .insert(payload)
      }

      if (result.error) throw result.error

      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Update your personal and employment information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NRC Number
                  </label>
                  <input
                    type="text"
                    value={profile.nrc}
                    onChange={(e) => handleChange('nrc', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 123456/78/9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File/Man Number
                  </label>
                  <input
                    type="text"
                    value={profile.file_number}
                    onChange={(e) => handleChange('file_number', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your residential address"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={profile.position_id}
                    onChange={(e) => handleChange('position_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>{pos.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={profile.department_id}
                    onChange={(e) => handleChange('department_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    value={profile.grade_id}
                    onChange={(e) => handleChange('grade_id', e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Joined
                  </label>
                  <input
                    type="date"
                    value={profile.date_joined}
                    onChange={(e) => handleChange('date_joined', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status
                  </label>
                  <select
                    value={profile.employment_status}
                    onChange={(e) => handleChange('employment_status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={profile.emergency_contact_name}
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.emergency_contact_phone}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-line text-5xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.full_name || 'Your Name'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center text-sm">
                  <i className="ri-briefcase-line text-gray-400 mr-3"></i>
                  <span className="text-gray-600">
                    {positions.find(p => p.id === profile.position_id)?.title || 'No position set'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <i className="ri-building-line text-gray-400 mr-3"></i>
                  <span className="text-gray-600">
                    {departments.find(d => d.id === profile.department_id)?.name || 'No department'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <i className="ri-medal-line text-gray-400 mr-3"></i>
                  <span className="text-gray-600">
                    {grades.find(g => g.id === profile.grade_id)
                      ? `Grade ${grades.find(g => g.id === profile.grade_id).grade_number}`
                      : 'No grade set'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <i className="ri-calendar-line text-gray-400 mr-3"></i>
                  <span className="text-gray-600">
                    {profile.date_joined 
                      ? `Joined ${new Date(profile.date_joined).toLocaleDateString()}`
                      : 'Join date not set'}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <i className="ri-checkbox-circle-line text-gray-400 mr-3"></i>
                  <span className={`capitalize ${
                    profile.employment_status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {profile.employment_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <i className="ri-information-line mr-1"></i>
                  Keep your profile up to date for accurate records and communication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Profile
