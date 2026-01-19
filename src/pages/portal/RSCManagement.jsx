import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const RSCManagement = () => {
  const { userRole } = useAuth()
  const [rscs, setRscs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [editingRSC, setEditingRSC] = useState(null)
  const [selectedRSC, setSelectedRSC] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    email: '',
    phone: '',
    description: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    if (userRole === 'admin') {
      fetchRSCs()
    }
  }, [userRole])

  const fetchRSCs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rsc_centres')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setRscs(data || [])
    } catch (error) {
      console.error('Error fetching RSCs:', error)
      alert('Failed to fetch RSCs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchGalleryImages = async (rscId) => {
    try {
      const { data, error } = await supabase
        .from('rsc_gallery')
        .select('*')
        .eq('rsc_id', rscId)
        .order('display_order', { ascending: true })

      if (error) throw error
      setGalleryImages(data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      const rscData = {
        name: formData.name,
        location: formData.location,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        display_order: parseInt(formData.display_order),
        is_active: formData.is_active
      }

      if (editingRSC) {
        const { error } = await supabase
          .from('rsc_centres')
          .update(rscData)
          .eq('id', editingRSC.id)

        if (error) throw error
        alert('RSC updated successfully!')
      } else {
        const { error } = await supabase
          .from('rsc_centres')
          .insert(rscData)

        if (error) throw error
        alert('RSC added successfully!')
      }

      setShowModal(false)
      resetForm()
      fetchRSCs()
    } catch (error) {
      console.error('Error saving RSC:', error)
      alert('Failed to save RSC: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rsc) => {
    setEditingRSC(rsc)
    setFormData({
      name: rsc.name,
      location: rsc.location,
      address: rsc.address || '',
      email: rsc.email || '',
      phone: rsc.phone || '',
      description: rsc.description || '',
      display_order: rsc.display_order,
      is_active: rsc.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this RSC? This will also delete all gallery images.')) return

    try {
      const { error } = await supabase
        .from('rsc_centres')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('RSC deleted successfully!')
      fetchRSCs()
    } catch (error) {
      console.error('Error deleting RSC:', error)
      alert('Failed to delete RSC: ' + error.message)
    }
  }

  const handleManageGallery = async (rsc) => {
    setSelectedRSC(rsc)
    await fetchGalleryImages(rsc.id)
    setShowGalleryModal(true)
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`)
        continue
      }

      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`)
        continue
      }

      try {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const { error } = await supabase
            .from('rsc_gallery')
            .insert({
              rsc_id: selectedRSC.id,
              image_url: reader.result,
              display_order: galleryImages.length
            })

          if (error) throw error
          await fetchGalleryImages(selectedRSC.id)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image: ' + error.message)
      }
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return

    try {
      const { error } = await supabase
        .from('rsc_gallery')
        .delete()
        .eq('id', imageId)

      if (error) throw error
      await fetchGalleryImages(selectedRSC.id)
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      email: '',
      phone: '',
      description: '',
      display_order: 0,
      is_active: true
    })
    setEditingRSC(null)
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
            <h1 className="text-3xl font-bold text-gray-900">RSC Management</h1>
            <p className="text-gray-600 mt-2">Manage Regulatory Services Centres</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            Add RSC
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total RSCs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{rscs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-building-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active RSCs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {rscs.filter(r => r.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Locations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(rscs.map(r => r.location)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-map-pin-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* RSCs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading RSCs...</p>
            </div>
          ) : rscs.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-building-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No RSCs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rscs.map((rsc) => (
                <div key={rsc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-building-line text-2xl text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{rsc.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <i className="ri-map-pin-line mr-1"></i>
                            {rsc.location}
                          </p>
                          {rsc.address && (
                            <p className="text-sm text-gray-600">
                              <i className="ri-home-line mr-1"></i>
                              {rsc.address}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {rsc.email && (
                              <span className="text-xs text-gray-500">
                                <i className="ri-mail-line mr-1"></i>
                                {rsc.email}
                              </span>
                            )}
                            {rsc.phone && (
                              <span className="text-xs text-gray-500">
                                <i className="ri-phone-line mr-1"></i>
                                {rsc.phone}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Order: {rsc.display_order}
                            </span>
                            {rsc.is_active ? (
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
                            onClick={() => handleManageGallery(rsc)}
                            className="px-3 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                            title="Manage Gallery"
                          >
                            <i className="ri-image-line"></i>
                          </button>
                          <button
                            onClick={() => handleEdit(rsc)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(rsc.id)}
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
                  {editingRSC ? 'Edit RSC' : 'Add RSC'}
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
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
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
                  {loading ? 'Saving...' : editingRSC ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && selectedRSC && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Gallery - {selectedRSC.name}
                </h2>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB per image. Multiple images allowed.</p>
              </div>

              {galleryImages.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-image-line text-6xl text-gray-300"></i>
                  <p className="text-gray-600 mt-4">No images yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'Gallery image'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RSCManagement
