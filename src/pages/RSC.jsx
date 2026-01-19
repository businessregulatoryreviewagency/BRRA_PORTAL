import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RSC = () => {
  const [rscs, setRscs] = useState([])
  const [selectedRSC, setSelectedRSC] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchRSCs()
  }, [])

  const fetchRSCs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rsc_centres')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setRscs(data || [])
    } catch (error) {
      console.error('Error fetching RSCs:', error)
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

  const handleViewGallery = async (rsc) => {
    setSelectedRSC(rsc)
    await fetchGalleryImages(rsc.id)
  }

  const participatingAgencies = [
    'Ministry of Tourism (Department of Tourism)',
    'Zambia Tourism Agency (ZTA)',
    'Patents and Companies Registration Agency (PACRA)',
    'Zambia Revenue Authority (ZRA)',
    'National Pension Scheme Authority (NAPSA)',
    'Zambia Development Agency (ZDA)',
    'Workers Compensation Fund Control Board (WCFCB)',
    'Department of National Parks and Wildlife',
    'Zambia Environmental Management Agency (ZEMA)',
    'Department of Cooperatives',
    'Citizens Economic Empowerment Commission (CEEC)',
    'Local/Civic Authorities',
    'Zambia Public Procurement Authority (ZPPA)'
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[400px] lg:h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Regulatory Services Centres (RSCs)
          </h1>
          <p className="text-xl text-emerald-300 mb-6">
            Improving delivery and accessibility of business regulatory services to reduce the cost of doing business in Zambia
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/about" className="hover:text-white">About</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">RSCs</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">One-Stop Shop</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">
              A One-Stop Shop for Business Regulation
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              The Business Regulatory Review Agency (BRRA) is mandated to coordinate the establishment, 
              operationalisation and roll out of Regulatory Services Centres (RSCs) in Zambia. This strategy 
              streamlines procedures, reduces registration time, and increases accessibility by placing key 
              regulatory agencies under one roof.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mt-4">
              We have established <strong>six (6) fully fledged RSCs</strong> in Chipata, Kabwe, Kitwe, 
              Livingstone, Lusaka, and Solwezi, with Chinsali and Kasama centers also operational.
            </p>
          </div>

          {/* Objectives */}
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-8 lg:p-12 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Objectives of RSCs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-speed-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Streamlining Processes</h4>
                  <p className="text-gray-600">Streamlining business registration processes for efficiency.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-list-3-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Single Licensing System</h4>
                  <p className="text-gray-600">Providing a unified licensing system for businesses.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-time-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Reducing Time</h4>
                  <p className="text-gray-600">Reducing procedures and time for registration completion.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-building-2-line text-2xl text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Increasing Accessibility</h4>
                  <p className="text-gray-600">Placing all institutions under one roof for easy access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Participating Agencies */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Partners</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Participating Agencies</h2>
            <p className="text-gray-600 mt-4">Key regulatory agencies working together under one roof</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participatingAgencies.map((agency, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-government-line text-blue-600"></i>
                </div>
                <p className="text-sm text-gray-700">{agency}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSC Locations */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Find Us</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Our Locations</h2>
            <p className="text-gray-600 mt-4">Find a Regulatory Services Centre near you</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading RSC locations...</p>
            </div>
          ) : rscs.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-map-pin-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No RSC locations available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rscs.map((rsc) => (
                <div 
                  key={rsc.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                    <i className="ri-building-line text-6xl text-white opacity-50"></i>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{rsc.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center">
                        <i className="ri-map-pin-line mr-2 text-emerald-600"></i>
                        {rsc.location}
                      </p>
                      {rsc.address && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <i className="ri-home-line mr-2 text-emerald-600"></i>
                          {rsc.address}
                        </p>
                      )}
                      {rsc.email && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <i className="ri-mail-line mr-2 text-emerald-600"></i>
                          {rsc.email}
                        </p>
                      )}
                      {rsc.phone && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <i className="ri-phone-line mr-2 text-emerald-600"></i>
                          {rsc.phone}
                        </p>
                      )}
                    </div>
                    {rsc.description && (
                      <p className="text-sm text-gray-600 mb-4">{rsc.description}</p>
                    )}
                    <button
                      onClick={() => handleViewGallery(rsc)}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="ri-image-line"></i>
                      View Gallery
                    </button>
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
          <h2 className="text-3xl font-bold mb-4">Need Assistance?</h2>
          <p className="text-blue-100 mb-8">
            Contact your nearest RSC for support with business registration and regulatory services.
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

      {/* Gallery Modal */}
      {selectedRSC && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRSC.name}</h2>
                <p className="text-sm text-gray-600">{selectedRSC.location}</p>
              </div>
              <button
                onClick={() => setSelectedRSC(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              {galleryImages.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-image-line text-6xl text-gray-300"></i>
                  <p className="text-gray-600 mt-4">No gallery images available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((image) => (
                    <div 
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.caption || 'Gallery image'}
                        className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                          <p className="text-white text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <i className="ri-close-line text-4xl"></i>
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  )
}

export default RSC
