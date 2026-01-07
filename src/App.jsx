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
import UserDashboard from './pages/portal/UserDashboard'
import StaffDashboard from './pages/portal/StaffDashboard'
import AdminDashboard from './pages/portal/AdminDashboard'

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
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
