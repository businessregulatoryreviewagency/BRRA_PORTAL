import { Link } from 'react-router-dom'

const Departments = () => {
  const departments = [
    {
      id: 'executive',
      icon: 'ri-user-star-line',
      title: 'Office Of The Executive Director',
      brief: 'Strategic leadership and coordination of Agency programmes and activities.',
      description: 'The Office of the Director and Chief Executive Officer (CEO) provides strategic focus and direction, as well as coordinating the implementation of the programmes and activities of the Agency. In addition, it ensures that there are effective linkages among and within the Departments which strengthens internal systems, and improves coordination and communication for effective performance of the Agency. Overall, the Director and CEO is responsible for executing the annual work plan as approved by the Committee in a given financial year.',
      responsibilities: [
        'Provide strategic focus and direction',
        'Coordinate implementation of programmes and activities',
        'Ensure effective linkages among and within Departments',
        'Strengthen internal systems',
        'Execute annual work plan as approved by the Committee'
      ]
    },
    {
      id: 'regulatory-affairs',
      icon: 'ri-file-text-line',
      title: 'Regulatory Affairs Department',
      brief: 'Ensuring policies and laws regulating business activity are sound and of high quality.',
      description: 'The Regulatory Affairs Department is responsible for ensuring that policies and laws regulating business activity are sound, of high quality and do not unnecessarily add to the cost of doing business.',
      responsibilities: [
        'Review and approve proposed policies and laws regulating business activity',
        'Review regulatory frameworks and make recommendations for appropriate interventions',
        'Develop standards and guidelines for undertaking RIAs and public consultations',
        'Provide technical support to Regulatory Agencies and Public Bodies in undertaking regulatory impact assessments',
        'Monitor and evaluate the business regulatory environment in the various sectors'
      ]
    },
    {
      id: 'business-facilitation',
      icon: 'ri-team-line',
      title: 'Business Facilitation And Engagement Department',
      brief: 'Coordinating interventions to improve regulatory services delivery.',
      description: 'This Department is responsible for coordinating the development and implementation of interventions aimed at improving regulatory services delivery in order to reduce the cost of doing business.',
      responsibilities: [
        'Maintain the e-Registry and update it on a continuous basis',
        'Coordinate the establishment of the Single Licensing Systems for sectors and sub-sectors in order to streamline licensing procedures',
        'Coordinate the establishment and roll out of Regulatory Services Centres (RSCs) in order to facilitate effective and efficient regulatory services delivery',
        'Engage regulators and other key stakeholders on regulatory matters in order to facilitate development of appropriate business regulatory interventions',
        'Coordinate development and delivery of capacity building programmes for regulatory agencies in order to enhance their service delivery'
      ]
    },
    {
      id: 'legal',
      icon: 'ri-scales-3-line',
      title: 'Legal Unit',
      brief: 'Providing secretarial and legal services to the Committee.',
      description: 'The Legal unit is responsible for providing secretarial and legal services to the Committee and ensuring compliance with the Business Regulatory Act No. 3 of 2014.',
      responsibilities: [
        'Provide secretarial services to the Committee',
        'Provide legal services and advice',
        'Ensure compliance with the Business Regulatory Act No. 3 of 2014',
        'Draft and review legal documents',
        'Handle legal matters and compliance issues'
      ]
    },
    {
      id: 'human-capital',
      icon: 'ri-group-line',
      title: 'Human Capital And Administration Unit',
      brief: 'Managing human resources and providing logistical support services.',
      description: 'The Human Capital and Administration Unit is responsible for the efficient and effective management and provision of logistical support services. In this regard, the role of the unit involves managing and developing the human and institutional capacity for efficient and effective delivery of services.',
      responsibilities: [
        'Manage and develop human resources',
        'Provide logistical support services',
        'Develop institutional capacity',
        'Coordinate staff training and development',
        'Ensure efficient and effective service delivery'
      ]
    },
    {
      id: 'finance',
      icon: 'ri-money-dollar-circle-line',
      title: 'Finance Unit',
      brief: 'Managing financial resources and ensuring prudent utilization.',
      description: 'The function of this unit involves management of financial resources. In this regard the unit is responsible for acquisition and prudent utilization of financial resources, keeping a record of financial transactions, providing input into drawing of annual budgets and work plans, preparation of financial reports and bank reconciliations.',
      responsibilities: [
        'Manage and acquire financial resources',
        'Ensure prudent utilization of financial resources',
        'Keep record of financial transactions',
        'Provide input into drawing of annual budgets and work plans',
        'Prepare financial reports and bank reconciliations'
      ]
    },
    {
      id: 'internal-audit',
      icon: 'ri-shield-check-line',
      title: 'Internal Audit And Risk Management Unit',
      brief: 'Ensuring correct use of funds and compliance to financial procedures.',
      description: 'The Internal Audit Unit is responsible for reviewing and ensuring the correct use and application of funds, conducting audits for compliance to financial procedures and processes, and developing and ensuring adherence to internal financial controls.',
      responsibilities: [
        'Review and ensure correct use and application of funds',
        'Conduct audits for compliance to financial procedures and processes',
        'Develop and ensure adherence to internal financial controls',
        'Identify and mitigate financial risks',
        'Provide audit reports and recommendations'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
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
