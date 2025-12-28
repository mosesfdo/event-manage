import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import EventsPage from './pages/events/EventsPage'
import EventDetailPage from './pages/events/EventDetailPage'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ClubAdminDashboard from './pages/dashboard/ClubAdminDashboard'
import FacultyDashboard from './pages/dashboard/FacultyDashboard'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'
import CertificateVerificationPage from './pages/CertificateVerificationPage'
import NotFoundPage from './pages/NotFoundPage'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }
  
  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case 'student':
        return <Navigate to="/dashboard/student" replace />
      case 'club_admin':
        return <Navigate to="/dashboard/club-admin" replace />
      case 'faculty':
        return <Navigate to="/dashboard/faculty" replace />
      case 'super_admin':
        return <Navigate to="/dashboard/super-admin" replace />
      default:
        return <Navigate to="/events" replace />
    }
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      
      <Route path="/certificate/verify/:id" element={<CertificateVerificationPage />} />
      
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/events" element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/events/:id" element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        } />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/club-admin" element={
          <ProtectedRoute allowedRoles={['club_admin']}>
            <ClubAdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/faculty" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App