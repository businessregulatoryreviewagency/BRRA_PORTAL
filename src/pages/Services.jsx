import { Link } from 'react-router-dom'

const Services = () => {
  const riaSteps = [
    { step: 1, title: 'Problem Identification', description: 'Identify the regulatory problem that needs to be addressed' },
    { step: 2, title: 'Objective Setting', description: 'Define clear objectives for the proposed regulation' },
    { step: 3, title: 'Options Analysis', description: 'Identify and analyze alternative regulatory and non-regulatory options' },
    { step: 4, title: 'Impact Assessment', description: 'Assess the costs and benefits of each option' },
    { step: 5, title: 'Stakeholder Consultation', description: 'Engage with affected parties to gather input and feedback' },
    { step: 6, title: 'Recommendation', description: 'Select and recommend the most appropriate option' },
  ]

  const rscLocations = [
    { city: 'Lusaka', status: 'Operational', address: 'Plot 2251, Fairley Road, Ridgeway' },
    { city: 'Ndola', status: 'Operational', address: 'Copperbelt Province' },
    { city: 'Livingstone', status: 'Coming Soon', address: 'Southern Province' },
    { city: 'Kitwe', status: 'Coming Soon', address: 'Copperbelt Province' },
  ]

  const eServices = [
    { icon: 'ri-file-list-3-line', title: 'e-Registry', description: 'Search and find business licensing requirements' },
    { icon: 'ri-send-plane-line', title: 'Online Submissions', description: 'Submit RIA frameworks electronically' },
    { icon: 'ri-search-line', title: 'Track Applications', description: 'Monitor the status of your submissions' },
    { icon: 'ri-download-line', title: 'Document Downloads', description: 'Access forms, guidelines, and templates' },
    { icon: 'ri-notification-line', title: 'Notifications', description: 'Receive updates on regulatory changes' },
    { icon: 'ri-customer-service-line', title: 'Online Support', description: 'Get help through our digital channels' },
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-xl text-emerald-300">Enhancing Zambia's Regulatory Environment</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Services</span>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Our Core Services</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              BRRA provides essential services to improve Zambia's regulatory environment, 
              reduce the cost of doing business, and support sustainable economic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="#ria" className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-xl text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <i className="ri-bar-chart-box-line text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Regulatory Impact Assessment</h3>
              <p className="text-blue-100">Evidence-based analysis of proposed regulations</p>
            </a>
            <a href="#rsc" className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-xl text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <i className="ri-building-2-line text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Regulatory Services Centres</h3>
              <p className="text-emerald-100">Physical centers for improved service delivery</p>
            </a>
            <a href="#eservices" className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 rounded-xl text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <i className="ri-computer-line text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">e-Services</h3>
              <p className="text-amber-100">Digital platforms for business compliance</p>
            </a>
          </div>
        </div>
      </section>

      {/* RIA Section */}
      <section id="ria" className="py-16 lg:py-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <i className="ri-bar-chart-box-line text-3xl text-blue-600"></i>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Regulatory Impact Assessment (RIA)
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Regulatory Impact Assessment is a vital process that ensures regulations are effective, 
                efficient, and evidence-based. It analyzes the potential consequences of new rules to 
                prevent unnecessary burdens on businesses while achieving policy objectives.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <i className="ri-check-double-line text-emerald-600 text-xl mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-gray-900">Evidence-Based Policy Making</h4>
                    <p className="text-gray-600 text-sm">Decisions grounded in data and analysis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="ri-check-double-line text-emerald-600 text-xl mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cost-Benefit Analysis</h4>
                    <p className="text-gray-600 text-sm">Comprehensive assessment of regulatory impacts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="ri-check-double-line text-emerald-600 text-xl mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-gray-900">Stakeholder Input</h4>
                    <p className="text-gray-600 text-sm">Inclusive consultation with affected parties</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit RIA Framework
                <i className="ri-arrow-right-line ml-2"></i>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">RIA Process Steps</h3>
              <div className="space-y-4">
                {riaSteps.map((item) => (
                  <div key={item.step} className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4 flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSC Section */}
      <section id="rsc" className="py-16 lg:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">RSC Locations</h3>
                <div className="space-y-4">
                  {rscLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <i className="ri-map-pin-line text-emerald-600 text-xl mr-3"></i>
                        <div>
                          <h4 className="font-semibold text-gray-900">{location.city}</h4>
                          <p className="text-gray-600 text-sm">{location.address}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        location.status === 'Operational' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {location.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <i className="ri-building-2-line text-3xl text-emerald-600"></i>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Regulatory Services Centres (RSC)
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Regulatory Services Centres are physical locations established to improve regulatory 
                service delivery across Zambia. BRRA coordinates the establishment and rollout of 
                these centers to reduce the cost of doing business and improve accessibility.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-emerald-600">2</p>
                  <p className="text-sm text-gray-600">Operational Centres</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">2</p>
                  <p className="text-sm text-gray-600">Coming Soon</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <i className="ri-check-line text-emerald-600 mr-2"></i>
                  One-stop shop for business licensing
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="ri-check-line text-emerald-600 mr-2"></i>
                  Reduced processing times
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="ri-check-line text-emerald-600 mr-2"></i>
                  Expert guidance and support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* e-Services Section */}
      <section id="eservices" className="py-16 lg:py-24 bg-gradient-to-br from-blue-900 to-emerald-800 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <i className="ri-computer-line text-3xl"></i>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">e-Services</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Digital platforms simplifying business registration and compliance with enhanced 
              transparency, expedited processes, and reduced administrative burden.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eServices.map((service, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-colors"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <i className={`${service.icon} text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-blue-100 text-sm">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/e-registry"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <i className="ri-search-line mr-2"></i>
              Access e-Registry Portal
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Assistance?</h2>
          <p className="text-gray-600 mb-8">
            Our team is ready to help you navigate the regulatory landscape and access our services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="ri-mail-line mr-2"></i>
              Contact Us
            </Link>
            <a 
              href="tel:+260211259165"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <i className="ri-phone-line mr-2"></i>
              Call: +260 211 259165
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
