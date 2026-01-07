import { Link } from 'react-router-dom'

const Management = () => {
  const executiveTeam = [
    {
      name: 'Dr. Sarah Mwanza',
      title: 'Director General',
      department: 'Office of the Executive Director',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
      bio: 'Dr. Mwanza brings over 20 years of experience in regulatory policy and public administration. She holds a PhD in Public Policy from the University of Zambia and has previously served in various senior government positions.',
      email: 'director@brra.org.zm',
      phone: '+260 211 259165'
    },
    {
      name: 'Mr. James Phiri',
      title: 'Deputy Director',
      department: 'Policy Analysis & Research',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Mr. Phiri specializes in economic impact assessment and regulatory framework development. He has extensive experience in policy analysis and has contributed to numerous regulatory reforms.',
      email: 'policy@brra.org.zm',
      phone: '+260 211 259166'
    },
    {
      name: 'Ms. Grace Banda',
      title: 'Deputy Director',
      department: 'Stakeholder Engagement',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      bio: 'Ms. Banda leads stakeholder consultation and public engagement initiatives. She has built strong relationships with regulatory agencies and the business community.',
      email: 'stakeholder@brra.org.zm',
      phone: '+260 211 259167'
    }
  ]

  const seniorManagement = [
    {
      name: 'Mr. David Mwale',
      title: 'Manager',
      department: 'Regulatory Services Centres',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      bio: 'Coordinates the establishment and operation of RSCs across Zambia.'
    },
    {
      name: 'Mrs. Patricia Lungu',
      title: 'Manager',
      department: 'Legal Services',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop',
      bio: 'Provides legal advice and ensures regulatory compliance.'
    },
    {
      name: 'Mr. Emmanuel Chanda',
      title: 'Manager',
      department: 'Finance & Administration',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      bio: 'Manages financial resources and administrative functions.'
    },
    {
      name: 'Ms. Natasha Zulu',
      title: 'Manager',
      department: 'ICT & e-Services',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      bio: 'Develops and maintains digital platforms and IT infrastructure.'
    },
    {
      name: 'Mr. Andrew Tembo',
      title: 'Manager',
      department: 'Human Resources',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop',
      bio: 'Oversees human capital management and staff development.'
    },
    {
      name: 'Mrs. Mary Kasonde',
      title: 'Manager',
      department: 'Communications',
      image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=300&h=300&fit=crop',
      bio: 'Manages public relations and corporate communications.'
    }
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Management Team</h1>
          <p className="text-xl text-emerald-300">The Leaders Driving BRRA's Mission</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Management</span>
          </div>
        </div>
      </section>

      {/* Executive Team */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Leadership</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Executive Team</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our executive team provides strategic leadership and ensures effective implementation 
              of BRRA's mandate.
            </p>
          </div>

          {/* Director General - Featured */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-blue-900 to-emerald-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-square lg:aspect-auto">
                  <img 
                    src={executiveTeam[0].image}
                    alt={executiveTeam[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center text-white">
                  <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
                    {executiveTeam[0].title}
                  </span>
                  <h3 className="text-3xl font-bold mt-2">{executiveTeam[0].name}</h3>
                  <p className="text-blue-200 font-medium mt-1">{executiveTeam[0].department}</p>
                  <p className="text-blue-100 mt-6 leading-relaxed">{executiveTeam[0].bio}</p>
                  
                  <div className="mt-8 space-y-3">
                    <a 
                      href={`mailto:${executiveTeam[0].email}`}
                      className="flex items-center text-emerald-300 hover:text-emerald-200"
                    >
                      <i className="ri-mail-line mr-3"></i>
                      {executiveTeam[0].email}
                    </a>
                    <a 
                      href={`tel:${executiveTeam[0].phone}`}
                      className="flex items-center text-emerald-300 hover:text-emerald-200"
                    >
                      <i className="ri-phone-line mr-3"></i>
                      {executiveTeam[0].phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deputy Directors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {executiveTeam.slice(1).map((member, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="aspect-square">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-emerald-600 font-medium text-sm">{member.title}</span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-1">{member.name}</h3>
                    <p className="text-blue-600 text-sm mt-1">{member.department}</p>
                    <p className="text-gray-600 text-sm mt-3">{member.bio}</p>
                    
                    <div className="mt-4 space-y-1">
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                      >
                        <i className="ri-mail-line mr-2"></i>
                        {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Senior Management */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Department Heads</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Senior Management</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seniorManagement.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-emerald-600 font-medium text-sm">{member.title}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{member.name}</h3>
                  <p className="text-blue-600 text-sm mt-1">{member.department}</p>
                  <p className="text-gray-600 text-sm mt-3">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizational Chart CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">View Our Organizational Structure</h2>
          <p className="text-blue-100 mb-8">
            Learn more about how BRRA is organized and the roles of each department.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/departments"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Departments
            </Link>
            <Link 
              to="/board"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Meet the Board
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Management
