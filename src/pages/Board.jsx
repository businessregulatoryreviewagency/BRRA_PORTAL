import { Link } from 'react-router-dom'

const Board = () => {
  const boardMembers = [
    {
      name: 'Hon. Dr. Mutale Nalumango',
      title: 'Board Chairperson',
      organization: 'Ministry of Commerce, Trade and Industry',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      bio: 'Provides strategic oversight and leadership to the BRRA Board, ensuring alignment with national development objectives.'
    },
    {
      name: 'Mr. Kelvin Bwalya',
      title: 'Vice Chairperson',
      organization: 'Private Sector Representative',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      bio: 'Represents the interests of the private sector and brings extensive experience in business development.'
    },
    {
      name: 'Ms. Chanda Mwamba',
      title: 'Board Member',
      organization: 'Zambia Chamber of Commerce',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
      bio: 'Advocates for business-friendly regulatory reforms and represents the chamber\'s member interests.'
    },
    {
      name: 'Dr. Peter Mumba',
      title: 'Board Member',
      organization: 'Ministry of Finance',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      bio: 'Provides expertise on fiscal policy implications of regulatory decisions.'
    },
    {
      name: 'Mrs. Grace Tembo',
      title: 'Board Member',
      organization: 'Attorney General\'s Office',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&h=300&fit=crop',
      bio: 'Ensures legal compliance and provides guidance on regulatory legal frameworks.'
    },
    {
      name: 'Mr. Joseph Mulenga',
      title: 'Board Member',
      organization: 'Small Business Association',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      bio: 'Champions the interests of small and medium enterprises in regulatory matters.'
    },
    {
      name: 'Dr. Sarah Mwanza',
      title: 'Board Secretary',
      organization: 'BRRA Director General',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop',
      bio: 'Serves as the link between the Board and BRRA management, ensuring effective governance.'
    }
  ]

  const boardFunctions = [
    {
      icon: 'ri-compass-3-line',
      title: 'Strategic Direction',
      description: 'Setting the strategic direction and priorities for BRRA'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Governance Oversight',
      description: 'Ensuring proper governance and accountability'
    },
    {
      icon: 'ri-file-list-3-line',
      title: 'Policy Approval',
      description: 'Approving major policies and regulatory frameworks'
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Financial Oversight',
      description: 'Overseeing financial management and budgets'
    }
  ]

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[300px] lg:h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-900 to-emerald-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=600&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Board of Directors</h1>
          <p className="text-xl text-emerald-300">Governance and Strategic Leadership</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-white">Board</span>
          </div>
        </div>
      </section>

      {/* Board Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Governance</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-6">About the Board</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                The BRRA Board of Directors provides strategic oversight and governance for the Agency. 
                Comprising representatives from government, the private sector, and civil society, the 
                Board ensures that BRRA fulfills its mandate effectively and transparently.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The Board meets quarterly to review progress, approve policies, and provide strategic 
                direction. It plays a crucial role in ensuring that BRRA's activities align with 
                national development objectives and international best practices.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {boardFunctions.map((func, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className={`${func.icon} text-2xl text-blue-600`}></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{func.title}</h3>
                  <p className="text-gray-600 text-sm">{func.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Board Members */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Leadership</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Board Members</h2>
          </div>

          {/* Chairperson - Featured */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="aspect-square md:aspect-auto">
                  <img 
                    src={boardMembers[0].image}
                    alt={boardMembers[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:col-span-2 p-8 flex flex-col justify-center">
                  <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                    {boardMembers[0].title}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{boardMembers[0].name}</h3>
                  <p className="text-blue-600 font-medium mt-1">{boardMembers[0].organization}</p>
                  <p className="text-gray-600 mt-4 leading-relaxed">{boardMembers[0].bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Board Members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.slice(1).map((member, index) => (
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
                  <p className="text-blue-600 text-sm mt-1">{member.organization}</p>
                  <p className="text-gray-600 text-sm mt-3">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Management Team</h2>
          <p className="text-gray-600 mb-8">
            Learn about the executive team responsible for day-to-day operations.
          </p>
          <Link 
            to="/management"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Management Team
            <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Board
