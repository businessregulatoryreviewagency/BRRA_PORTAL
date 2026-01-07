import { Link } from 'react-router-dom'

const Departments = () => {
  const departments = [
    {
      id: 'executive',
      icon: 'ri-user-star-line',
      title: 'Office of the Executive Director',
      brief: 'Strategic leadership and coordination of Agency programmes and activities.',
      description: 'The Office of the Director and Chief Executive Officer (CEO) provides strategic focus and direction, as well as coordinating the implementation of the programmes and activities of the Agency. In addition, it ensures that there are effective internal controls and governance structures in place.',
      responsibilities: [
        'Provide strategic leadership and direction',
        'Coordinate implementation of programmes',
        'Ensure effective internal controls',
        'Maintain governance structures',
        'Represent BRRA at national and international forums'
      ]
    },
    {
      id: 'policy',
      icon: 'ri-file-text-line',
      title: 'Policy Analysis & Research',
      brief: 'Conducting regulatory impact assessments and policy research.',
      description: 'This department is responsible for conducting comprehensive regulatory impact assessments, policy analysis, and research to support evidence-based decision making in regulatory matters.',
      responsibilities: [
        'Conduct Regulatory Impact Assessments',
        'Analyze proposed regulations and policies',
        'Undertake research on regulatory best practices',
        'Provide policy recommendations',
        'Monitor regulatory trends and developments'
      ]
    },
    {
      id: 'stakeholder',
      icon: 'ri-team-line',
      title: 'Stakeholder Engagement',
      brief: 'Managing relationships with regulatory agencies and the business community.',
      description: 'This department manages relationships with regulatory agencies, the business community, and other stakeholders to ensure inclusive and participatory regulatory processes.',
      responsibilities: [
        'Coordinate stakeholder consultations',
        'Manage public engagement initiatives',
        'Build partnerships with regulatory agencies',
        'Facilitate dialogue between government and business',
        'Organize workshops and training sessions'
      ]
    },
    {
      id: 'rsc',
      icon: 'ri-building-2-line',
      title: 'Regulatory Services Centres',
      brief: 'Coordinating the establishment and operation of RSCs across Zambia.',
      description: 'This department coordinates the establishment, rollout, and operation of Regulatory Services Centres across Zambia to improve service delivery and reduce the cost of doing business.',
      responsibilities: [
        'Plan and establish new RSC locations',
        'Coordinate RSC operations',
        'Monitor service delivery standards',
        'Train RSC staff',
        'Evaluate RSC performance'
      ]
    },
    {
      id: 'legal',
      icon: 'ri-scales-3-line',
      title: 'Legal Services',
      brief: 'Providing legal advice and ensuring regulatory compliance.',
      description: 'The Legal Services department provides legal advice, ensures regulatory compliance, and supports the development of regulatory frameworks in line with the law.',
      responsibilities: [
        'Provide legal advice to the Agency',
        'Review regulatory proposals for legal compliance',
        'Draft and review legal documents',
        'Handle legal matters and disputes',
        'Ensure compliance with statutory requirements'
      ]
    },
    {
      id: 'finance',
      icon: 'ri-money-dollar-circle-line',
      title: 'Finance & Administration',
      brief: 'Managing financial resources and administrative functions.',
      description: 'This department manages the financial resources of the Agency, ensures proper accounting practices, and oversees administrative functions to support efficient operations.',
      responsibilities: [
        'Manage financial resources and budgets',
        'Ensure proper accounting and reporting',
        'Oversee procurement processes',
        'Manage human resources',
        'Coordinate administrative services'
      ]
    },
    {
      id: 'ict',
      icon: 'ri-computer-line',
      title: 'ICT & e-Services',
      brief: 'Developing and maintaining digital platforms and IT infrastructure.',
      description: 'The ICT department develops and maintains digital platforms, including the e-Registry portal, and ensures robust IT infrastructure to support the Agency\'s operations.',
      responsibilities: [
        'Develop and maintain e-Registry portal',
        'Manage IT infrastructure',
        'Implement digital transformation initiatives',
        'Ensure cybersecurity and data protection',
        'Provide technical support'
      ]
    }
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Departments</h1>
          <p className="text-xl text-emerald-300">Discover the specialized units that drive BRRA's mission</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Departments</span>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Organizational Structure</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">How We're Organized</h2>
            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              BRRA is organized into specialized departments and units, each playing a crucial role in 
              enhancing Zambia's regulatory environment and supporting business growth.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-16">
            {departments.map((dept) => (
              <a
                key={dept.id}
                href={`#${dept.id}`}
                className="bg-gray-50 p-4 rounded-lg text-center hover:bg-blue-50 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 transition-colors">
                  <i className={`${dept.icon} text-xl text-blue-600 group-hover:text-white transition-colors`}></i>
                </div>
                <p className="text-xs font-medium text-gray-700 line-clamp-2">{dept.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Department Details */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {departments.map((dept, index) => (
              <div 
                key={dept.id}
                id={dept.id}
                className={`scroll-mt-24 ${index % 2 === 0 ? '' : ''}`}
              >
                <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${index % 2 === 0 ? '' : ''}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    {/* Left - Icon and Title */}
                    <div className={`p-8 bg-gradient-to-br ${
                      index % 3 === 0 ? 'from-blue-600 to-blue-700' :
                      index % 3 === 1 ? 'from-emerald-600 to-emerald-700' :
                      'from-amber-500 to-orange-500'
                    } text-white flex flex-col justify-center`}>
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <i className={`${dept.icon} text-3xl`}></i>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{dept.title}</h3>
                      <p className="text-white/80">{dept.brief}</p>
                    </div>

                    {/* Right - Description and Responsibilities */}
                    <div className="lg:col-span-2 p-8">
                      <p className="text-gray-600 mb-6 leading-relaxed">{dept.description}</p>
                      
                      <h4 className="font-semibold text-gray-900 mb-4">Key Responsibilities:</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dept.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start">
                            <i className="ri-check-line text-emerald-600 mr-2 mt-1"></i>
                            <span className="text-gray-600 text-sm">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Learn More?</h2>
          <p className="text-gray-600 mb-8">
            Contact us to learn more about our departments and how we can assist you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/management"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Meet Our Management
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Departments
