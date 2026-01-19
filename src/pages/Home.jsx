import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredNews, setFeaturedNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [expandedArticle, setExpandedArticle] = useState(null)

  useEffect(() => {
    fetchFeaturedNews()
  }, [])

  const fetchFeaturedNews = async () => {
    try {
      setLoadingNews(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setFeaturedNews(data || [])
    } catch (error) {
      console.error('Error fetching featured news:', error)
    } finally {
      setLoadingNews(false)
    }
  }

  const handleReadMore = (article) => {
    setExpandedArticle(article)
  }

  const closeArticle = () => {
    setExpandedArticle(null)
  }

  const handleDownloadPdf = (article) => {
    if (article.pdf_url) {
      const link = document.createElement('a')
      link.href = article.pdf_url
      link.download = `${article.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
  }

  const services = [
    {
      icon: 'ri-bar-chart-box-line',
      title: 'Regulatory Impact Assessment (RIA)',
      description: 'A vital process ensuring effective and efficient regulations through evidence-based analysis of potential consequences.',
      link: '/services#ria'
    },
    {
      icon: 'ri-building-2-line',
      title: 'Regulatory Services Centres (RSC)',
      description: 'Physical centers for improved regulatory service delivery, reducing the cost of doing business across Zambia.',
      link: '/services#rsc'
    },
    {
      icon: 'ri-computer-line',
      title: 'e-Services',
      description: 'Digital platforms simplifying business registration and compliance with enhanced transparency and expedited processes.',
      link: '/services#eservices'
    }
  ]

  const quickLinks = [
    { icon: 'ri-file-list-3-line', title: 'e-Registry Portal', description: 'Search business licenses', link: '/e-registry' },
    { icon: 'ri-send-plane-line', title: 'Submit RIA Framework', description: 'For regulatory agencies', link: '/submit' },
    { icon: 'ri-search-line', title: 'Track Submission', description: 'Check your status', link: '/track' },
    { icon: 'ri-download-line', title: 'Download Forms', description: 'Access official forms', link: '/forms' },
    { icon: 'ri-phone-line', title: 'Contact Us', description: 'Get in touch', link: '/contact' },
    { icon: 'ri-file-pdf-line', title: 'Strategic Plan', description: '2022-2026 PDF', link: '/strategic-plan' },
  ]

  const strategicObjectives = [
    'Improve regulation of business policies and laws',
    'Improve management of Regulatory Services',
    'Enhance business Regulatory Impact Assessment processes',
    'Enhance awareness of BRRA\'s mandate',
    'Improve financial resource management',
    'Improve management systems',
    'Improve human capital',
    'Improve office accommodation'
  ]

  // Display featured news from database or fallback to empty array
  const displayNews = featuredNews.length > 0 ? featuredNews : []

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            The Business Regulatory Review Agency
          </h1>
          <p className="text-xl sm:text-2xl text-emerald-300 font-medium mb-4">
            Promoting a Conducive Business Regulatory Environment
          </p>
          <p className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto">
            A statutory body under the Ministry of Commerce, Trade and Industry, ensuring efficient, 
            cost-effective, and accessible business licensing systems in Zambia.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/submit"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
              <i className="ri-send-plane-line mr-2"></i>
              Submit Framework
            </Link>
            <Link 
              to="/track"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <i className="ri-search-line mr-2"></i>
              Track Submission
            </Link>
            <Link 
              to="/news"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/30 flex items-center justify-center"
            >
              <i className="ri-newspaper-line mr-2"></i>
              Latest Notices
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <i className="ri-arrow-down-line text-white text-2xl"></i>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">
                About BRRA
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                The Business Regulatory Review Agency (BRRA) was established under the Business Regulatory Act 
                No. 3 of 2014, as amended by Act No. 14 of 2018. Operational since January 2016, BRRA's core 
                mandate is to ensure an efficient, cost-effective, and accessible business licensing system in Zambia.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <i className="ri-focus-3-line text-3xl text-blue-600 mb-2"></i>
                  <h4 className="font-semibold text-gray-900">Mission</h4>
                  <p className="text-sm text-gray-600 mt-1">Evidence-based regulatory frameworks</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <i className="ri-eye-line text-3xl text-emerald-600 mb-2"></i>
                  <h4 className="font-semibold text-gray-900">Vision</h4>
                  <p className="text-sm text-gray-600 mt-1">Leading regulatory excellence in Africa</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <i className="ri-star-line text-3xl text-amber-600 mb-2"></i>
                  <h4 className="font-semibold text-gray-900">Focus</h4>
                  <p className="text-sm text-gray-600 mt-1">Operational & business excellence</p>
                </div>
              </div>

              <Link 
                to="/about"
                className="inline-flex items-center mt-8 text-blue-600 font-semibold hover:text-blue-700"
              >
                Learn More About Us
                <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                alt="BRRA Team Meeting"
                className="rounded-xl shadow-lg w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-6 rounded-lg shadow-lg hidden lg:block">
                <p className="text-3xl font-bold">2016</p>
                <p className="text-sm text-emerald-100">Operational Since</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Quick Links</h2>
            <p className="text-gray-600 mt-4">Fast access to frequently used resources</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <i className={`${link.icon} text-2xl text-blue-600 group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Our Services</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              BRRA provides essential services to improve Zambia's regulatory environment and support business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className={`${service.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <Link 
                  to={service.link}
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                >
                  Learn More
                  <i className="ri-arrow-right-line ml-2"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Plan Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">2022-2026</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-6">Strategic Plan</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">
                Our Strategic Plan is aligned with the Eighth National Development Plan and complies with 
                the National Planning and Budgeting Act No. 1 of 2020, focusing on three key themes:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center bg-white/10 rounded-lg p-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-settings-3-line text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Operational Excellence</h4>
                    <p className="text-sm text-blue-200">High quality services delivery</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/10 rounded-lg p-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-team-line text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Strategic Partnerships</h4>
                    <p className="text-sm text-blue-200">Improved regulatory services</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/10 rounded-lg p-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-award-line text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Business Regulatory Excellence</h4>
                    <p className="text-sm text-blue-200">Conducive business environment</p>
                  </div>
                </div>
              </div>

              <a 
                href="/strategic-plan.pdf"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <i className="ri-download-line mr-2"></i>
                Download Strategic Plan
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Eight Strategic Objectives</h3>
              <ul className="space-y-3">
                {strategicObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-blue-100">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* e-Registry Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-search-2-line text-3xl text-emerald-600"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Zambia Business Licensing Information Portal
            </h2>
            <p className="text-lg text-emerald-600 font-medium mb-4">e-Registry</p>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Businesses operating in Zambia are typically required to obtain one or more licenses and permits, 
              depending on the activities of their enterprise. This portal enables you to obtain information 
              on the licenses pertaining to your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for business licenses..."
                className="flex-1 px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                <i className="ri-search-line mr-2"></i>
                Search
              </button>
            </div>

            <Link 
              to="/e-registry"
              className="inline-flex items-center mt-6 text-blue-600 font-medium hover:text-blue-700"
            >
              Browse All Licenses
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Stay Updated</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Latest News & Updates</h2>
            </div>
            <Link 
              to="/news"
              className="mt-4 sm:mt-0 inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
            >
              View All News
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>

          {loadingNews ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading news...</p>
            </div>
          ) : displayNews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <i className="ri-newspaper-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No news available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayNews.map((article) => (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="relative h-48 overflow-hidden">
                    {article.image_url ? (
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                        <i className="ri-newspaper-line text-6xl text-white opacity-50"></i>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{article.summary || article.content.substring(0, 100) + '...'}</p>
                    <button 
                      onClick={() => handleReadMore(article)}
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                    >
                      Read More
                      <i className="ri-arrow-right-line ml-2"></i>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expanded Article Modal */}
      {expandedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold capitalize">
                  {expandedArticle.category}
                </span>
                <span className="text-sm text-gray-500">
                  <i className="ri-calendar-line mr-1"></i>
                  {new Date(expandedArticle.published_at || expandedArticle.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={closeArticle}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 lg:p-8">
              {expandedArticle.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={expandedArticle.image_url}
                    alt={expandedArticle.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {expandedArticle.title}
              </h1>

              {expandedArticle.author_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <i className="ri-user-line"></i>
                  <span>By {expandedArticle.author_name}</span>
                </div>
              )}

              {expandedArticle.summary && (
                <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed">
                  {expandedArticle.summary}
                </p>
              )}

              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {expandedArticle.content}
                </div>
              </div>

              {expandedArticle.pdf_url && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <i className="ri-file-pdf-line text-2xl text-emerald-600"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">PDF Attachment</p>
                        <p className="text-sm text-gray-600">Size: {formatFileSize(expandedArticle.pdf_file_size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(expandedArticle)}
                      className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <i className="ri-download-line"></i>
                      Download PDF
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={closeArticle}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
