import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Management = () => {
  const [staffMembers, setStaffMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaffMembers()
  }, [])

  const fetchStaffMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('is_active', true)
        .order('position_level', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error fetching staff members:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedMembers = {
    1: staffMembers.filter(m => m.position_level === 1), // Executive Director
    2: staffMembers.filter(m => m.position_level === 2), // Directors
    3: staffMembers.filter(m => m.position_level === 3)  // Managers
  }

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

      {/* Staff Members */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading staff members...</p>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-team-line text-6xl text-gray-300"></i>
              <p className="text-gray-600 mt-4">No staff members available at the moment</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Executive Director */}
              {groupedMembers[1].length > 0 && (
                <div>
                  <div className="text-center mb-12">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Leadership</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Executive Director</h2>
                  </div>
                  {groupedMembers[1].map((member) => (
                    <div key={member.id} className="bg-gradient-to-br from-blue-900 to-emerald-800 rounded-2xl overflow-hidden shadow-xl mb-6">
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
                          <div className="aspect-square md:aspect-auto bg-gradient-to-br from-blue-700 to-emerald-700 flex items-center justify-center">
                            <i className="ri-user-line text-8xl text-white opacity-50"></i>
                          </div>
                        )}
                        <div className="md:col-span-2 p-8 lg:p-12 text-white flex flex-col justify-center">
                          <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">
                            {member.title}
                          </span>
                          <h3 className="text-3xl font-bold mt-2">{member.name}</h3>
                          {member.bio && <p className="text-blue-100 mt-4 leading-relaxed">{member.bio}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Directors */}
              {groupedMembers[2].length > 0 && (
                <div>
                  <div className="text-center mb-12">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Management</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Directors</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {groupedMembers[2].map((member) => (
                      <div 
                        key={member.id}
                        className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                          {member.image_url ? (
                            <div className="aspect-square">
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
                          <div className="p-6 flex flex-col justify-center">
                            <span className="text-emerald-600 font-medium text-sm">{member.title}</span>
                            <h3 className="text-xl font-semibold text-gray-900 mt-1">{member.name}</h3>
                            {member.bio && <p className="text-gray-600 text-sm mt-3">{member.bio}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Managers */}
              {groupedMembers[3].length > 0 && (
                <div>
                  <div className="text-center mb-12">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Department Heads</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Managers</h2>
                  </div>
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
