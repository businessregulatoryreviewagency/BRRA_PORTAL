import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const InformationManagement = () => {
  const { userRole, user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [selectedType, setSelectedType] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'publication',
    published_date: '',
    display_order: 0,
    is_published: true,
    pdf_file: null
  })

  useEffect(() => {
    if (userRole === 'admin') {
      fetchResources()
    }
  }, [userRole, selectedType])

  const fetchResources = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('information_resources')
        .select('*')
        .order('resource_type', { ascending: true })
        .order('display_order', { ascending: true })
        .order('published_date', { ascending: false })

      if (selectedType !== 'all') {
        query = query.eq('resource_type', selectedType)
      }

      const { data, error } = await query

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      alert('Failed to fetch resources: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file')
        return
      }

      setFormData({ ...formData, pdf_file: file })
    }
  }

  const convertPdfToBase64 = (file) => {
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

      let pdfUrl = editingResource?.pdf_url || null
      let fileSize = editingResource?.file_size || null

      if (formData.pdf_file) {
        pdfUrl = await convertPdfToBase64(formData.pdf_file)
        fileSize = formData.pdf_file.size
      }

      if (!pdfUrl) {
        alert('Please upload a PDF file')
        setLoading(false)
        return
      }

      const resourceData = {
        title: formData.title,
        description: formData.description,
        resource_type: formData.resource_type,
        pdf_url: pdfUrl,
        file_size: fileSize,
        published_date: formData.published_date || null,
        display_order: parseInt(formData.display_order),
        is_published: formData.is_published,
        created_by: user?.id
      }

      if (editingResource) {
        const { error } = await supabase
          .from('information_resources')
          .update(resourceData)
          .eq('id', editingResource.id)

        if (error) throw error
        alert('Resource updated successfully!')
      } else {
        const { error } = await supabase
          .from('information_resources')
          .insert(resourceData)

        if (error) throw error
        alert('Resource added successfully!')
      }

      setShowModal(false)
      resetForm()
      fetchResources()
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Failed to save resource: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      published_date: resource.published_date || '',
      display_order: resource.display_order,
      is_published: resource.is_published,
      pdf_file: null
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const { error } = await supabase
        .from('information_resources')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Resource deleted successfully!')
      fetchResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'publication',
      published_date: '',
      display_order: 0,
      is_published: true,
      pdf_file: null
    })
    setEditingResource(null)
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'publication': return 'Publication'
      case 'annual_report': return 'Annual Report'
      case 'download': return 'Download'
      default: return type
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'publication': return 'ri-book-line'
      case 'annual_report': return 'ri-file-chart-line'
      case 'download': return 'ri-download-line'
      default: return 'ri-file-line'
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
  }

  const groupedResources = {
    publication: resources.filter(r => r.resource_type === 'publication'),
    annual_report: resources.filter(r => r.resource_type === 'annual_report'),
    download: resources.filter(r => r.resource_type === 'download')
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
            <h1 className="text-3xl font-bold text-gray-900">Information Resources Management</h1>
            <p className="text-gray-600 mt-2">Manage publications, annual reports, and downloads</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            Add Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Resources</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{resources.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-folder-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Publications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedResources.publication.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-book-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Annual Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedResources.annual_report.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-chart-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groupedResources.download.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <i className="ri-download-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {['all', 'publication', 'annual_report', 'download'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-4 font-medium transition-colors ${
                selectedType === type
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'all' ? 'All Resources' : getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-folder-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No resources yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Resource
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      resource.resource_type === 'publication' ? 'bg-purple-100' :
                      resource.resource_type === 'annual_report' ? 'bg-emerald-100' :
                      'bg-amber-100'
                    }`}>
                      <i className={`${getTypeIcon(resource.resource_type)} text-2xl ${
                        resource.resource_type === 'publication' ? 'text-purple-600' :
                        resource.resource_type === 'annual_report' ? 'text-emerald-600' :
                        'text-amber-600'
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{resource.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {getTypeLabel(resource.resource_type)}
                            </span>
                            {resource.published_date && (
                              <span className="text-xs text-gray-500">
                                <i className="ri-calendar-line mr-1"></i>
                                {new Date(resource.published_date).toLocaleDateString()}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              <i className="ri-file-line mr-1"></i>
                              {formatFileSize(resource.file_size)}
                            </span>
                            <span className="text-xs text-gray-500">
                              <i className="ri-download-line mr-1"></i>
                              {resource.download_count} downloads
                            </span>
                            <span className="text-xs text-gray-500">
                              Order: {resource.display_order}
                            </span>
                            {resource.is_published ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
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
                  {editingResource ? 'Edit Resource' : 'Add Resource'}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Type *
                </label>
                <select
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="publication">Publication</option>
                  <option value="annual_report">Annual Report</option>
                  <option value="download">Download</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
                </label>
                <input
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File {!editingResource && '*'}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={!editingResource}
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 10MB. PDF files only.</p>
                {formData.pdf_file && (
                  <p className="text-sm text-green-600 mt-2">
                    <i className="ri-file-pdf-line mr-1"></i>
                    {formData.pdf_file.name} ({formatFileSize(formData.pdf_file.size)})
                  </p>
                )}
                {editingResource && !formData.pdf_file && (
                  <p className="text-sm text-gray-600 mt-2">
                    <i className="ri-file-pdf-line mr-1"></i>
                    Current file: {formatFileSize(editingResource.file_size)}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published (visible on public page)</span>
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
                  {loading ? 'Saving...' : editingResource ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InformationManagement
