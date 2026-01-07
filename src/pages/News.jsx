import { useState } from 'react'
import { Link } from 'react-router-dom'

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Policy Update', 'Announcement', 'Report', 'Guidelines', 'Consultation', 'Event']

  const newsArticles = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      category: 'Policy Update',
      date: 'December 15, 2025',
      title: 'New RIA Guidelines Released for Public Consultation',
      excerpt: 'BRRA has released updated guidelines for Regulatory Impact Assessment, inviting stakeholder feedback. The new guidelines aim to streamline the RIA process and improve the quality of regulatory analysis.',
      featured: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
      category: 'Announcement',
      date: 'December 10, 2025',
      title: 'BRRA Launches Regulatory Services Centre in Ndola',
      excerpt: 'A new RSC has been established to serve businesses in the Copperbelt Province, bringing regulatory services closer to the business community.',
      featured: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
      category: 'Report',
      date: 'December 5, 2025',
      title: 'Strategic Plan 2022-2026 Implementation Progress Report',
      excerpt: 'Review of achievements and milestones in implementing the current strategic plan, highlighting key accomplishments and areas for improvement.',
      featured: false
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
      category: 'Guidelines',
      date: 'November 28, 2025',
      title: 'Updated Business Licensing Procedures Announced',
      excerpt: 'Streamlined procedures aim to reduce processing time and improve efficiency for business license applications.',
      featured: false
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop',
      category: 'Consultation',
      date: 'November 20, 2025',
      title: 'Stakeholder Consultation on Mining Sector Regulations',
      excerpt: 'BRRA invites stakeholders to participate in consultations regarding proposed regulatory changes in the mining sector.',
      featured: false
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
      category: 'Event',
      date: 'November 15, 2025',
      title: 'BRRA Hosts Annual Regulatory Excellence Conference',
      excerpt: 'The conference brought together regulatory agencies, business leaders, and international experts to discuss best practices.',
      featured: false
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&h=400&fit=crop',
      category: 'Policy Update',
      date: 'November 10, 2025',
      title: 'New Framework for SME Regulatory Compliance',
      excerpt: 'BRRA introduces a simplified compliance framework designed specifically for small and medium enterprises.',
      featured: false
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop',
      category: 'Announcement',
      date: 'November 5, 2025',
      title: 'e-Registry Portal Upgrade Completed',
      excerpt: 'The upgraded portal features improved search functionality and a more user-friendly interface.',
      featured: false
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop',
      category: 'Report',
      date: 'October 30, 2025',
      title: 'Quarterly Regulatory Review Report Released',
      excerpt: 'The report provides an overview of regulatory activities and their impact on the business environment.',
      featured: false
    }
  ]

  const filteredNews = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredNews = filteredNews.filter(article => article.featured)
  const regularNews = filteredNews.filter(article => !article.featured)

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
      {featuredNews.length > 0 && selectedCategory === 'All' && !searchQuery && (
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
                      <img 
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">{article.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{article.excerpt}</p>
                      <Link 
                        to={`/news/${article.id}`}
                        className="inline-flex items-center mt-4 text-blue-600 font-medium hover:text-blue-700"
                      >
                        Read More
                        <i className="ri-arrow-right-line ml-2"></i>
                      </Link>
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
              {selectedCategory === 'All' ? 'All News' : selectedCategory}
            </h2>
            <p className="text-gray-600">
              {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-newspaper-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'All' && !searchQuery ? regularNews : filteredNews).map((article) => (
                <article 
                  key={article.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                    <Link 
                      to={`/news/${article.id}`}
                      className="inline-flex items-center mt-4 text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                      Read More
                      <i className="ri-arrow-right-line ml-1"></i>
                    </Link>
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
    </div>
  )
}

export default News
