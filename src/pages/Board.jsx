import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Board = () => {
  const [boardMembers, setBoardMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoardMembers()
  }, [])

  const fetchBoardMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .eq('is_active', true)
        .order('position_level', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error
      setBoardMembers(data || [])
    } catch (error) {
      console.error('Error fetching board members:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPositionLabel = (level) => {
    switch (level) {
      case 1: return 'Board Chair'
      case 2: return 'Vice Chair'
      case 3: return 'Board Member'
      default: return 'Board Member'
    }
  }

  const groupedMembers = {
    1: boardMembers.filter(m => m.position_level === 1),
    2: boardMembers.filter(m => m.position_level === 2),
    3: boardMembers.filter(m => m.position_level === 3)
  }

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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Board Members</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Distinguished leaders from government, private sector, and civil society providing strategic guidance.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading board members...</p>
            </div>
          ) : boardMembers.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-team-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No board members available at the moment</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Board Chair */}
              {groupedMembers[1].length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Board Chair</h3>
                  {groupedMembers[1].map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        {member.image_url ? (
                          <div className="aspect-square md:aspect-auto overflow-hidden">
                            <img 
                              src={member.image_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square md:aspect-auto bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                            <i className="ri-user-line text-8xl text-white opacity-50"></i>
                          </div>
                        )}
                        <div className="md:col-span-2 p-8 flex flex-col justify-center">
                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                            {member.title}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 mt-2">{member.name}</h3>
                          {member.email && (
                            <p className="text-blue-600 font-medium mt-1">
                              <i className="ri-mail-line mr-1"></i>
                              {member.email}
                            </p>
                          )}
                          {member.bio && <p className="text-gray-600 mt-4 leading-relaxed">{member.bio}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Vice Chair */}
              {groupedMembers[2].length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Vice Chair</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedMembers[2].map((member) => (
                      <div 
                        key={member.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {member.image_url ? (
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={member.image_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                            <i className="ri-user-line text-6xl text-white opacity-50"></i>
                          </div>
                        )}
                        <div className="p-6">
                          <span className="text-emerald-600 font-medium text-sm">{member.title}</span>
                          <h3 className="text-lg font-semibold text-gray-900 mt-1">{member.name}</h3>
                          {member.email && (
                            <p className="text-blue-600 text-sm mt-1">
                              <i className="ri-mail-line mr-1"></i>
                              {member.email}
                            </p>
                          )}
                          {member.bio && <p className="text-gray-600 text-sm mt-3">{member.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Board Members */}
              {groupedMembers[3].length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Board Members</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedMembers[3].map((member) => (
                      <div 
                        key={member.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {member.image_url ? (
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={member.image_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                            <i className="ri-user-line text-6xl text-white opacity-50"></i>
                          </div>
                        )}
                        <div className="p-6">
                          <span className="text-emerald-600 font-medium text-sm">{member.title}</span>
                          <h3 className="text-lg font-semibold text-gray-900 mt-1">{member.name}</h3>
                          {member.email && (
                            <p className="text-blue-600 text-sm mt-1">
                              <i className="ri-mail-line mr-1"></i>
                              {member.email}
                            </p>
                          )}
                          {member.bio && <p className="text-gray-600 text-sm mt-3">{member.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
