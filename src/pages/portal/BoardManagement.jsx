import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const BoardManagement = () => {
  const { userRole } = useAuth()
  const [boardMembers, setBoardMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    position_level: 3,
    bio: '',
    display_order: 0,
    is_active: true,
    image_file: null
  })

  useEffect(() => {
    if (userRole === 'admin') {
      fetchBoardMembers()
    }
  }, [userRole])

  const fetchBoardMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('position_level', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error
      setBoardMembers(data || [])
    } catch (error) {
      console.error('Error fetching board members:', error)
      alert('Failed to fetch board members: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setFormData({ ...formData, image_file: file })
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      let imageUrl = editingMember?.image_url || null

      if (formData.image_file) {
        imageUrl = await convertImageToBase64(formData.image_file)
      }

      const memberData = {
        name: formData.name,
        title: formData.title,
        email: formData.email,
        position_level: parseInt(formData.position_level),
        bio: formData.bio,
        display_order: parseInt(formData.display_order),
        is_active: formData.is_active,
        image_url: imageUrl
      }

      if (editingMember) {
        const { error } = await supabase
          .from('board_members')
          .update(memberData)
          .eq('id', editingMember.id)

        if (error) throw error
        alert('Board member updated successfully!')
      } else {
        const { error } = await supabase
          .from('board_members')
          .insert(memberData)

        if (error) throw error
        alert('Board member added successfully!')
      }

      setShowModal(false)
      resetForm()
      fetchBoardMembers()
    } catch (error) {
      console.error('Error saving board member:', error)
      alert('Failed to save board member: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      title: member.title,
      email: member.email || '',
      position_level: member.position_level,
      bio: member.bio || '',
      display_order: member.display_order,
      is_active: member.is_active,
      image_file: null
    })
    setImagePreview(member.image_url)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this board member?')) return

    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Board member deleted successfully!')
      fetchBoardMembers()
    } catch (error) {
      console.error('Error deleting board member:', error)
      alert('Failed to delete board member: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      email: '',
      position_level: 3,
      bio: '',
      display_order: 0,
      is_active: true,
      image_file: null
    })
    setImagePreview(null)
    setEditingMember(null)
  }

  const getPositionLabel = (level) => {
    switch (level) {
      case 1: return 'Board Chair'
      case 2: return 'Vice Chair'
      case 3: return 'Board Member'
      default: return 'Unknown'
    }
  }

  const groupedMembers = {
    1: boardMembers.filter(m => m.position_level === 1),
    2: boardMembers.filter(m => m.position_level === 2),
    3: boardMembers.filter(m => m.position_level === 3)
  }

  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Board Members Management</h1>
            <p className="text-gray-600 mt-2">Manage board members displayed on the public Board page</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            Add Board Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{boardMembers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-team-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Board Chair</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedMembers[1].length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-vip-crown-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Vice Chair</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedMembers[2].length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <i className="ri-medal-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Board Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedMembers[3].length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-star-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Board Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Board Members</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading board members...</p>
            </div>
          ) : boardMembers.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-team-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No board members yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Member
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {[1, 2, 3].map(level => (
                groupedMembers[level].length > 0 && (
                  <div key={level}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{getPositionLabel(level)}</h3>
                    <div className="space-y-3">
                      {groupedMembers[level].map((member) => (
                        <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            {member.image_url && (
                              <img
                                src={member.image_url}
                                alt={member.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                                  <p className="text-sm text-gray-600">{member.title}</p>
                                  {member.email && (
                                    <p className="text-sm text-blue-600 mt-1">
                                      <i className="ri-mail-line mr-1"></i>
                                      {member.email}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-500">
                                      Order: {member.display_order}
                                    </span>
                                    {member.is_active ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(member)}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(member.id)}
                                    className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMember ? 'Edit Board Member' : 'Add Board Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Chairperson, Member"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Level *
                </label>
                <select
                  value={formData.position_level}
                  onChange={(e) => setFormData({ ...formData, position_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={1}>Board Chair</option>
                  <option value={2}>Vice Chair</option>
                  <option value={3}>Board Member</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first within the same position level</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (visible on public page)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingMember ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardManagement
