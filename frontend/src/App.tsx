import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { apiClient } from './api'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import QuizPlayerPage from './pages/QuizPlayerPage'
import ResultPage from './pages/ResultPage'
import LeaderboardPage from './pages/LeaderboardPage'

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
        if (user && !user) {
          // User is already logged in, update store
          login(user, localStorage.getItem('auth-storage') || '')
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
        <Route path="/quizzes" element={<ProtectedRoute requiredRole="student"><div>Quizzes (Coming soon)</div></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute requiredRole="student"><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute requiredRole="student"><div>Attempt History (Coming soon)</div></ProtectedRoute>} />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={<ProtectedRoute requiredRole="instructor"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/instructor/quizzes" element={<ProtectedRoute requiredRole="instructor"><div>My Quizzes (Coming soon)</div></ProtectedRoute>} />
        <Route path="/instructor/questions" element={<ProtectedRoute requiredRole="instructor"><div>Question Bank (Coming soon)</div></ProtectedRoute>} />
        <Route path="/instructor/analytics" element={<ProtectedRoute requiredRole="instructor"><div>Analytics (Coming soon)</div></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><div>User Management (Coming soon)</div></ProtectedRoute>} />
        <Route path="/admin/flagged" element={<ProtectedRoute requiredRole="admin"><div>Flagged Attempts (Coming soon)</div></ProtectedRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'instructor' ? '/instructor/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} />} />
      </Routes>
    </Router>
  )
}
