import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FAQ = () => {
  const [categories, setCategories] = useState([])
  const [faqs, setFaqs] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchFAQs()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('faqs')
        .select(`
          *,
          faq_categories (
            id,
            name,
            icon
          )
        `)
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFAQ = async (faqId) => {
    if (expandedFAQ === faqId) {
      setExpandedFAQ(null)
    } else {
      setExpandedFAQ(faqId)
      // Increment view count
      try {
        await supabase.rpc('increment_faq_views', { faq_id: faqId })
      } catch (error) {
        console.error('Error incrementing views:', error)
      }
    }
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category_id === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[350px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-emerald-300">
            Find answers to common questions about business regulation, submissions, and our services
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/about" className="hover:text-white">About</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">FAQs</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Category Filter */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="ri-list-check text-xl"></i>
                    <span className="font-medium">All</span>
                    <span className="ml-auto text-sm">({faqs.length})</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <i className={`${category.icon} text-xl`}></i>
                      <span className="font-medium text-left flex-1">{category.name}</span>
                      <span className="text-sm">
                        ({faqs.filter(f => f.category_id === category.id).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content Area - FAQ Accordion */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-4">Loading FAQs...</p>
                </div>
              ) : filteredFAQs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <i className="ri-question-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                  <p className="text-gray-600">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'No FAQs available in this category yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div 
                      key={faq.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      <button
                        onClick={() => handleToggleFAQ(faq.id)}
                        className="w-full flex items-start gap-4 p-6 text-left"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${faq.faq_categories?.icon || 'ri-question-line'} text-2xl text-blue-600`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
                            {faq.question}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                              {faq.faq_categories?.name}
                            </span>
                            {faq.views_count > 0 && (
                              <span className="flex items-center gap-1">
                                <i className="ri-eye-line"></i>
                                {faq.views_count} views
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <i className={`ri-arrow-${expandedFAQ === faq.id ? 'up' : 'down'}-s-line text-2xl text-gray-400`}></i>
                        </div>
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6 pt-0">
                          <div className="pl-16 border-l-4 border-blue-600 ml-6">
                            <div className="pl-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Results Count */}
              {!loading && filteredFAQs.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-600">
                  Showing {filteredFAQs.length} of {faqs.length} FAQs
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <i className="ri-question-answer-line text-5xl mb-4"></i>
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 mb-8">
            Can't find the answer you're looking for? Our team is here to help.
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

export default FAQ
