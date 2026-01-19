import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, signOut, userRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userNavItems = [
    { name: 'Dashboard', path: '/portal/dashboard', icon: 'ri-dashboard-line', roles: ['user', 'staff', 'admin'] },
    { name: 'RIA Submissions', path: '/portal/ria-submissions', icon: 'ri-file-list-3-line', roles: ['user', 'staff', 'admin'] },
  ]

  const staffNavItems = [
    { name: 'Staff Dashboard', path: '/portal/staff', icon: 'ri-briefcase-line', roles: ['staff', 'admin'] },
    { name: 'Leave Management', path: '/portal/leave', icon: 'ri-calendar-check-line', roles: ['staff', 'admin'] },
    { name: 'Review Submissions', path: '/portal/staff/reviews', icon: 'ri-file-check-line', roles: ['staff', 'admin'] },
    { name: 'RIA Management', path: '/portal/ria-management', icon: 'ri-file-search-line', roles: ['staff', 'admin'] },
    { name: 'RIA Reports', path: '/portal/ria-reports', icon: 'ri-bar-chart-line', roles: ['staff', 'admin'] },
  ]

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/portal/admin', icon: 'ri-admin-line', roles: ['admin'] },
    { name: 'User Management', path: '/portal/admin/users', icon: 'ri-team-line', roles: ['admin'] },
    { name: 'Staff Management', path: '/portal/staff-management', icon: 'ri-group-line', roles: ['admin'] },
    { name: 'Board Members', path: '/portal/board-management', icon: 'ri-vip-crown-line', roles: ['admin'] },
    { name: 'Staff Members', path: '/portal/staff-members-management', icon: 'ri-user-star-line', roles: ['admin'] },
    { name: 'News Management', path: '/portal/news-management', icon: 'ri-newspaper-line', roles: ['admin'] },
    { name: 'Information Resources', path: '/portal/information-management', icon: 'ri-folder-line', roles: ['admin'] },
    { name: 'RSC Management', path: '/portal/rsc-management', icon: 'ri-building-line', roles: ['admin'] },
    { name: 'FAQ Management', path: '/portal/faq-management', icon: 'ri-question-answer-line', roles: ['admin'] },
    { name: 'System Settings', path: '/portal/admin/settings', icon: 'ri-settings-3-line', roles: ['admin'] },
  ]

  const allNavItems = [...userNavItems, ...staffNavItems, ...adminNavItems].filter(
    item => item.roles.includes(userRole)
  )

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} fixed h-full z-30`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {isSidebarOpen ? (
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-bold text-gray-900">BRRA Portal</span>
              </Link>
            ) : (
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold">B</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {allNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  <i className={`${item.icon} text-xl ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}></i>
                  {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-blue-600"></i>
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i className={`text-xl ${isSidebarOpen ? 'ri-menu-fold-line' : 'ri-menu-unfold-line'}`}></i>
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
              <i className="ri-notification-line text-xl"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              <i className="ri-home-line mr-1"></i>
              Back to Website
            </Link>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <i className="ri-logout-box-line mr-2"></i>
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
