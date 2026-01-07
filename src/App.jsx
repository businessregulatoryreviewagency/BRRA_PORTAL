import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Departments from './pages/Departments'
import Board from './pages/Board'
import Management from './pages/Management'
import News from './pages/News'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/board" element={<Board />} />
            <Route path="/management" element={<Management />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<News />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
