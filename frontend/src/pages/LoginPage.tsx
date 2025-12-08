import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { apiClient } from '../api'
import Layout from '../components/Layout'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.login(formData.email, formData.password)
      console.log('Login response:', response)
      const { user } = response.data
      
      if (!user) {
        setError('Invalid response from server - missing user')
        return
      }
      
      login(user)

      // Redirect based on role
      if (user.role === 'instructor') navigate('/instructor/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Login failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="p-8 md:p-10">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg transform transition-transform hover:scale-110">
                  <LogIn className="text-white" size={32} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg animate-pulse">
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-105' : ''}`}>
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-105' : ''}`}>
                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                    Create one now
                  </a>
                </p>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Demo:</span> Sign up first or use test credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
