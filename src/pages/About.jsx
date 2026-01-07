import { Link } from 'react-router-dom'

const About = () => {
  const contactInfo = [
    { icon: 'ri-map-pin-line', title: 'Address', content: 'Plot No. 2251, Fairley Road, Ridgeway, LUSAKA, ZAMBIA' },
    { icon: 'ri-time-line', title: 'Office Hours', content: 'Monday - Friday, 8:00AM - 5:00PM' },
    { icon: 'ri-phone-line', title: 'Phone', content: '+260 211 259165' },
    { icon: 'ri-mail-line', title: 'Email', content: 'info@brra.org.zm' },
  ]

  const coreFunctions = [
    {
      icon: 'ri-bar-chart-box-line',
      title: 'Regulatory Impact Assessment',
      description: 'Conduct comprehensive analysis of proposed regulations. Assess impacts on businesses, consumers, and the economy.'
    },
    {
      icon: 'ri-group-line',
      title: 'Stakeholder Consultation',
      description: 'Facilitate engagement between regulators and stakeholders. Ensure inclusive policy development.'
    },
    {
      icon: 'ri-file-search-line',
      title: 'Policy Review & Analysis',
      description: 'Review existing regulatory frameworks. Identify gaps, overlaps, and improvement opportunities.'
    },
    {
      icon: 'ri-graduation-cap-line',
      title: 'Capacity Building',
      description: 'Provide training to regulatory agencies. Share best practices in regulatory development.'
    },
    {
      icon: 'ri-lightbulb-line',
      title: 'Research & Development',
      description: 'Study regulatory trends and international best practices. Address emerging regulatory challenges.'
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Monitoring & Evaluation',
      description: 'Monitor implementation and effectiveness of regulations. Recommend improvements based on evidence.'
    }
  ]

  const leadership = [
    {
      name: 'Dr. Sarah Mwanza',
      title: 'Director General',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      bio: 'Dr. Mwanza brings over 20 years of experience in regulatory policy and public administration.'
    },
    {
      name: 'Mr. James Phiri',
      title: 'Deputy Director, Policy Analysis',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      bio: 'Mr. Phiri specializes in economic impact assessment and regulatory framework development.'
    },
    {
      name: 'Ms. Grace Banda',
      title: 'Deputy Director, Stakeholder Engagement',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
      bio: 'Ms. Banda leads our stakeholder consultation and public engagement initiatives.'
    }
  ]

  const partners = [
    { name: 'ZTA', fullName: 'Zambia Tourism Agency' },
    { name: 'ZMA', fullName: 'Zambia Medicines Authority' },
    { name: 'ZBS', fullName: 'Zambia Bureau of Standards' },
    { name: 'NAPSA', fullName: 'National Pension Scheme Authority' },
    { name: 'ZPPA', fullName: 'Zambia Public Procurement Authority' },
    { name: 'MCTI', fullName: 'Ministry of Commerce, Trade and Industry' },
    { name: 'CEEC', fullName: 'Citizens Economic Empowerment Commission' },
    { name: 'PACRA', fullName: 'Patents and Companies Registration Agency' },
  ]

  const values = [
    { icon: 'ri-eye-line', title: 'Transparency', description: 'Open and accountable processes' },
    { icon: 'ri-star-line', title: 'Excellence', description: 'Commitment to quality and best practices' },
    { icon: 'ri-shield-check-line', title: 'Integrity', description: 'Ethical conduct in all our activities' },
    { icon: 'ri-lightbulb-flash-line', title: 'Innovation', description: 'Embracing new ideas and technologies' },
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">About BRRA</h1>
          <p className="text-xl text-emerald-300">Promoting a Conducive Business Regulatory Environment</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">About</span>
          </div>
        </div>
      </section>

      {/* Mission & Mandate */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Our Purpose</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">Mission & Mandate</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                To ensure that Zambia's regulatory frameworks are evidence-based, proportionate, and conducive 
                to sustainable economic growth while protecting public interests and promoting good governance.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="ri-check-line text-emerald-600"></i>
                  </div>
                  <p className="text-gray-600">Promote evidence-based regulatory decision making</p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="ri-check-line text-emerald-600"></i>
                  </div>
                  <p className="text-gray-600">Ensure stakeholder participation in regulatory processes</p>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="ri-check-line text-emerald-600"></i>
                  </div>
                  <p className="text-gray-600">Enhance regulatory quality and effectiveness</p>
                </div>
              </div>
            </div>

            <div>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                alt="Team Meeting"
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${item.icon} text-2xl text-blue-600`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Functions */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Core Functions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFunctions.map((func, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${func.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{func.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{func.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Leadership</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((person, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{person.name}</h3>
                  <p className="text-emerald-600 font-medium mb-3">{person.title}</p>
                  <p className="text-gray-600 text-sm">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/management"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Full Management Team
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Collaboration</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Our Partners</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-4 rounded-lg text-center hover:bg-emerald-50 transition-colors cursor-default"
                title={partner.fullName}
              >
                <p className="font-bold text-gray-900">{partner.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{partner.fullName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">What We Stand For</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-colors"
              >
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${value.icon} text-2xl`}></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-blue-100 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
