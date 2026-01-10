import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Departments from './pages/Departments'
import Board from './pages/Board'
import Management from './pages/Management'
import News from './pages/News'
import Information from './pages/Information'
import UserDashboard from './pages/portal/UserDashboard'
import StaffDashboard from './pages/portal/StaffDashboard'
import AdminDashboard from './pages/portal/AdminDashboard'
import UserManagement from './pages/portal/UserManagement'
import LeaveManagement from './pages/portal/LeaveManagement'
import StaffManagement from './pages/portal/StaffManagement'
import NewsManagement from './pages/portal/NewsManagement'
import BoardManagement from './pages/portal/BoardManagement'
import StaffMembersManagement from './pages/portal/StaffMembersManagement'
import InformationManagement from './pages/portal/InformationManagement'
import Profile from './pages/portal/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/departments" element={<Layout><Departments /></Layout>} />
          <Route path="/board" element={<Layout><Board /></Layout>} />
          <Route path="/management" element={<Layout><Management /></Layout>} />
          <Route path="/news" element={<Layout><News /></Layout>} />
          <Route path="/information" element={<Layout><Information /></Layout>} />
          <Route path="/news/:id" element={<Layout><News /></Layout>} />

          {/* Protected Portal Routes */}
          <Route path="/portal/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><UserDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/staff" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <DashboardLayout><StaffDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><UserManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/leave" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <DashboardLayout><LeaveManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/staff-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><StaffManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/news-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><NewsManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/board-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><BoardManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/staff-members-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><StaffMembersManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/information-management" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><InformationManagement /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portal/profile" element={
            <ProtectedRoute>
              <DashboardLayout><Profile /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
