import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { apiClient } from './api'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import LandingPage from './pages/LandingPage'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorQuizzesPage from './pages/InstructorQuizzesPage'
import InstructorAnalyticsPage from './pages/InstructorAnalyticsPage'
import InstructorProfilePage from './pages/InstructorProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import QuizPlayerPage from './pages/QuizPlayerPage'
import ResultPage from './pages/ResultPage'
import LeaderboardPage from './pages/LeaderboardPage'
import QuizzesPage from './pages/QuizzesPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

// Components
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { user, login } = useAuthStore()

  // Load user on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.getCurrentUser()
        const { user } = response.data
        if (user) {
          // User is already logged in, update store
          login(user)
        }
      } catch (err) {
        // User not logged in or session expired
      }
    }
    if (!user) {
      loadUser()
    }
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute requiredRole="student"><QuizPlayerPage /></ProtectedRoute>} />
        <Route path="/quiz/:quizId/results/:attemptId" element={<ProtectedRoute requiredRole="student"><ResultPage /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute requiredRole="student"><QuizzesPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute requiredRole="student"><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute requiredRole="student"><HistoryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="student"><ProfilePage /></ProtectedRoute>} />
        <Route path="/instructor/profile" element={<ProtectedRoute requiredRole="instructor"><ProfilePage /></ProtectedRoute>} />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={<ProtectedRoute requiredRole="instructor"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/instructor/quizzes" element={<ProtectedRoute requiredRole="instructor"><InstructorQuizzesPage /></ProtectedRoute>} />
        <Route path="/instructor/analytics" element={<ProtectedRoute requiredRole="instructor"><InstructorAnalyticsPage /></ProtectedRoute>} />

        {/* Instructor Profile Route */}
        <Route path="/instructor/profile" element={<ProtectedRoute requiredRole="instructor"><InstructorProfilePage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><div>User Management (Coming soon)</div></ProtectedRoute>} />
        <Route path="/admin/flagged" element={<ProtectedRoute requiredRole="admin"><div>Flagged Attempts (Coming soon)</div></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'instructor' ? '/instructor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />
            : <LandingPage />
        } />
      </Routes>
    </Router>
  )
}
