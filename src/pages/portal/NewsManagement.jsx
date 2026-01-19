import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const NewsManagement = () => {
  const { user, userRole } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'general',
    is_published: false,
    is_featured: false,
    image_file: null,
    pdf_file: null
  })

  useEffect(() => {
    if (userRole === 'admin') {
      fetchNews()
    }
  }, [userRole])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
      alert('Failed to fetch news: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setFormData({ ...formData, image_file: file })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePdfChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF size must be less than 10MB')
        return
      }

      // Validate file type
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

      // Get author name from staff profile
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      let imageUrl = editingNews?.image_url || null
      let pdfUrl = editingNews?.pdf_url || null
      let pdfFileSize = editingNews?.pdf_file_size || null

      // Convert image to base64 if new image uploaded
      if (formData.image_file) {
        imageUrl = await convertImageToBase64(formData.image_file)
      }

      // Convert PDF to base64 if new PDF uploaded
      if (formData.pdf_file) {
        pdfUrl = await convertPdfToBase64(formData.pdf_file)
        pdfFileSize = formData.pdf_file.size
      }

      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        image_url: imageUrl,
        pdf_url: pdfUrl,
        pdf_file_size: pdfFileSize,
        author_id: user.id,
        author_name: profile?.full_name || user.email,
        published_at: formData.is_published ? new Date().toISOString() : null
      }

      if (editingNews) {
        // Update existing news
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id)

        if (error) throw error
        alert('News updated successfully!')
      } else {
        // Create new news
        const { error } = await supabase
          .from('news')
          .insert(newsData)

        if (error) throw error
        alert('News created successfully!')
      }

      setShowModal(false)
      resetForm()
      fetchNews()
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Failed to save news: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      summary: newsItem.summary || '',
      content: newsItem.content,
      category: newsItem.category,
      is_published: newsItem.is_published,
      is_featured: newsItem.is_featured,
      image_file: null,
      pdf_file: null
    })
    setImagePreview(newsItem.image_url)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('News deleted successfully!')
      fetchNews()
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Failed to delete news: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'general',
      is_published: false,
      is_featured: false,
      image_file: null,
      pdf_file: null
    })
    setImagePreview(null)
    setEditingNews(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
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
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 mt-2">Create and manage news articles</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            Create News
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{news.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-newspaper-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {news.filter(n => n.is_published).length}
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
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {news.filter(n => !n.is_published).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <i className="ri-draft-line text-2xl text-white"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Featured</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {news.filter(n => n.is_featured).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-star-line text-2xl text-white"></i>
            </div>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All News Articles</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading news...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-newspaper-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No news articles yet</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Article
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              <i className="ri-user-line mr-1"></i>
                              {item.author_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              <i className="ri-calendar-line mr-1"></i>
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.category === 'announcement' ? 'bg-blue-100 text-blue-700' :
                              item.category === 'event' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.category}
                            </span>
                            {item.is_published && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Published
                              </span>
                            )}
                            {item.is_featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                <i className="ri-star-fill"></i> Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNews ? 'Edit News Article' : 'Create News Article'}
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
              {/* Title */}
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

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary for preview"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                </select>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Attachment (Optional)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 10MB. PDF files only.</p>
                {formData.pdf_file && (
                  <p className="text-sm text-green-600 mt-2">
                    <i className="ri-file-pdf-line mr-1"></i>
                    {formData.pdf_file.name} ({formatFileSize(formData.pdf_file.size)})
                  </p>
                )}
                {editingNews && editingNews.pdf_url && !formData.pdf_file && (
                  <p className="text-sm text-gray-600 mt-2">
                    <i className="ri-file-pdf-line mr-1"></i>
                    Current PDF: {formatFileSize(editingNews.pdf_file_size)}
                  </p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Feature on home page</span>
                </label>
              </div>

              {/* Buttons */}
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
                  {loading ? 'Saving...' : editingNews ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsManagement
