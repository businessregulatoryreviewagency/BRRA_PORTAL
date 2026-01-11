import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newsArticles, setNewsArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedArticle, setExpandedArticle] = useState(null)

  const categories = ['All', 'general', 'newsletter', 'announcement', 'event']

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error
      setNewsArticles(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }


  const filteredNews = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredNews = filteredNews.filter(article => article.is_featured)
  const regularNews = filteredNews.filter(article => !article.is_featured)

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

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">News & Updates</h1>
          <p className="text-xl text-emerald-300">Stay Informed About Regulatory Developments</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">News</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {!loading && featuredNews.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Stories</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredNews.map((article) => (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-video md:aspect-auto overflow-hidden">
                      {article.image_url ? (
                        <img 
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                          <i className="ri-newspaper-line text-6xl text-white opacity-50"></i>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded capitalize">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{article.summary || article.content.substring(0, 150) + '...'}</p>
                      <button 
                        onClick={() => handleReadMore(article)}
                        className="inline-flex items-center mt-4 text-blue-600 font-medium hover:text-blue-700"
                      >
                        Read More
                        <i className="ri-arrow-right-line ml-2"></i>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All News' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </h2>
            {!loading && (
              <p className="text-gray-600">
                {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading news articles...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-newspaper-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">
                {newsArticles.length === 0 
                  ? 'No news articles have been published yet.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'All' && !searchQuery ? regularNews : filteredNews).map((article) => (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
                >
                  <div className="aspect-video overflow-hidden">
                    {article.image_url ? (
                      <img 
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                        <i className="ri-newspaper-line text-6xl text-white opacity-50"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded capitalize">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.summary || article.content.substring(0, 100) + '...'}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <button 
                        onClick={() => handleReadMore(article)}
                        className="inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-700"
                      >
                        Read More
                        <i className="ri-arrow-right-line ml-1"></i>
                      </button>
                      {article.pdf_url && (
                        <button
                          onClick={() => handleDownloadPdf(article)}
                          className="inline-flex items-center text-sm text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          <i className="ri-file-pdf-line mr-1"></i>
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination placeholder */}
          <div className="flex items-center justify-center mt-12 gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              <i className="ri-arrow-left-line"></i>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="ri-mail-send-line text-5xl mb-4"></i>
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-8">
            Stay updated with the latest regulatory news, policy updates, and announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
            />
            <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              Subscribe
            </button>
          </div>
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

export default News
