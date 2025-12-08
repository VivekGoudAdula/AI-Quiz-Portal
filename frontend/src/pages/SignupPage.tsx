import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { apiClient } from '../api'
import Layout from '../components/Layout'
import { Eye, EyeOff, User, Mail, Lock, UserCheck } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.signup(formData.name, formData.email, formData.password, formData.role)
      console.log('Signup response:', response)
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
      console.error('Signup error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Signup failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = formData.password.length >= 8 
    ? formData.password.match(/[A-Z]/) && formData.password.match(/[0-9]/) 
      ? 'strong' 
      : 'medium'
    : 'weak'

  const strengthColor = passwordStrength === 'strong' ? 'bg-green-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -mx-4 px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

            <div className="p-8 md:p-10">
              {/* Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 shadow-lg transform transition-transform hover:scale-110">
                  <UserCheck className="text-white" size={32} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Join Us
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg animate-pulse">
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-105' : ''}`}>
                    <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg dark:bg-gray-700 dark:text-white bg-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
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
                  {/* Password strength indicator */}
                  <div className="mt-2 space-y-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor} transition-all duration-300 ${formData.password.length < 4 ? 'w-1/4' : formData.password.length < 8 ? 'w-2/4' : 'w-full'}`}></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Password must be 8+ chars with uppercase & number
                    </p>
                  </div>
                </div>

                {/* Role field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 focus:shadow-lg dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={20} />
                      <span>Sign Up</span>
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

              {/* Login link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <a href="/login" className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
