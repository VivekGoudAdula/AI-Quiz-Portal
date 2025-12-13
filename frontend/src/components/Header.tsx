import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, Moon, Sun, User } from 'lucide-react'
import { useAuthStore, useThemeStore } from '../store'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleDarkMode } = useThemeStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span>📚</span>
            <span>Quiz Portal</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-6">
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard" className="hover:text-blue-200 transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-blue-700">Dashboard</Link>
                  <Link to="/quizzes" className="hover:text-blue-200 transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-blue-700">Quizzes</Link>
                  <Link to="/leaderboard" className="hover:text-blue-200 transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-blue-700">Leaderboard</Link>
                  <Link to="/history" className="hover:text-blue-200 transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-blue-700">History</Link>
                </>
              )}
              {user.role === 'instructor' && (
                <>
                  <Link to="/instructor/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                  <Link to="/instructor/quizzes" className="hover:text-blue-200 transition">My Quizzes</Link>
                  <Link to="/instructor/analytics" className="hover:text-blue-200 transition">Analytics</Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
                  <Link to="/admin/users" className="hover:text-blue-200 transition">Users</Link>
                  <Link to="/admin/flagged" className="hover:text-blue-200 transition">Flagged</Link>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 hover:bg-blue-700 rounded-lg transition">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={user.role === 'instructor' ? "/instructor/profile" : "/profile"} className="p-2 hover:bg-blue-700 rounded-lg transition" title="Profile">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow">
                      <User size={20} className="text-gray-400" />
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-blue-700 rounded-lg transition" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link to="/login" className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition font-medium">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-500">
            {user ? (
              <>
                {user.role === 'student' && (
                  <>
                    <Link to="/dashboard" className="block py-2 hover:text-blue-200 transition-all hover:pl-2">Dashboard</Link>
                    <Link to="/quizzes" className="block py-2 hover:text-blue-200 transition-all hover:pl-2">Quizzes</Link>
                    <Link to="/leaderboard" className="block py-2 hover:text-blue-200 transition-all hover:pl-2">Leaderboard</Link>
                    <Link to="/history" className="block py-2 hover:text-blue-200 transition-all hover:pl-2">History</Link>
                  </>
                )}
                <button onClick={handleLogout} className="w-full text-left py-2 hover:text-blue-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-blue-200">Login</Link>
                <Link to="/signup" className="block py-2 hover:text-blue-200">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
