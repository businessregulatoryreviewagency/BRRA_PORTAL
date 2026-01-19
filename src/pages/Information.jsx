import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Information = () => {
  const [activeTab, setActiveTab] = useState('publications')
  const [resources, setResources] = useState({
    publications: [],
    annual_reports: [],
    downloads: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      
      // Fetch all published resources
      const { data, error } = await supabase
        .from('information_resources')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('published_date', { ascending: false })

      if (error) throw error

      // Group by type
      const grouped = {
        publications: data?.filter(r => r.resource_type === 'publication') || [],
        annual_reports: data?.filter(r => r.resource_type === 'annual_report') || [],
        downloads: data?.filter(r => r.resource_type === 'download') || []
      }

      setResources(grouped)
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resource) => {
    try {
      // Increment download count
      await supabase.rpc('increment_download_count', { resource_id: resource.id })

      // Trigger download
      const link = document.createElement('a')
      link.href = resource.pdf_url
      link.download = `${resource.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tabs = [
    { id: 'publications', label: 'Publications', icon: 'ri-book-line', count: resources.publications.length },
    { id: 'annual_reports', label: 'Annual Reports', icon: 'ri-file-chart-line', count: resources.annual_reports.length },
    { id: 'downloads', label: 'Downloads', icon: 'ri-download-line', count: resources.downloads.length }
  ]

  const getCurrentResources = () => {
    switch (activeTab) {
      case 'publications': return resources.publications
      case 'annual_reports': return resources.annual_reports
      case 'downloads': return resources.downloads
      default: return []
    }
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case 'publications':
        return 'Access our research papers, policy briefs, and regulatory publications'
      case 'annual_reports':
        return 'View our annual reports and performance reviews'
      case 'downloads':
        return 'Download forms, templates, and other useful resources'
      default: return ''
    }
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Information Resources</h1>
          <p className="text-xl text-emerald-300">Publications, Reports & Downloads</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Information</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col sm:flex-row border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${tab.icon} text-xl`}></i>
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <p className="text-gray-600 text-center">{getTabDescription()}</p>
            </div>
          </div>

          {/* Resources List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading resources...</p>
            </div>
          ) : getCurrentResources().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <i className="ri-folder-open-line text-6xl text-gray-300"></i>
              <h3 className="text-xl font-semibold text-gray-900 mt-4">No resources available</h3>
              <p className="text-gray-600 mt-2">Check back later for new {activeTab.replace('_', ' ')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {getCurrentResources().map((resource) => (
                <div 
                  key={resource.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activeTab === 'publications' ? 'bg-purple-100' :
                        activeTab === 'annual_reports' ? 'bg-emerald-100' :
                        'bg-amber-100'
                      }`}>
                        <i className={`${
                          activeTab === 'publications' ? 'ri-book-line' :
                          activeTab === 'annual_reports' ? 'ri-file-chart-line' :
                          'ri-download-line'
                        } text-3xl ${
                          activeTab === 'publications' ? 'text-purple-600' :
                          activeTab === 'annual_reports' ? 'text-emerald-600' :
                          'text-amber-600'
                        }`}></i>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          {resource.published_date && (
                            <span className="flex items-center">
                              <i className="ri-calendar-line mr-1"></i>
                              {formatDate(resource.published_date)}
                            </span>
                          )}
                          <span className="flex items-center">
                            <i className="ri-file-line mr-1"></i>
                            PDF • {formatFileSize(resource.file_size)}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-download-line mr-1"></i>
                            {resource.download_count} downloads
                          </span>
                        </div>

                        <button
                          onClick={() => handleDownload(resource)}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <i className="ri-download-line mr-2"></i>
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Information?</h2>
          <p className="text-blue-100 mb-8">
            Can't find what you're looking for? Contact us for assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              to="/services"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Information
