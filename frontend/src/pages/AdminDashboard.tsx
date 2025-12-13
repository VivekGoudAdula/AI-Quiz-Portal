import { useEffect, useState } from 'react'

import { apiClient } from '../api'
import Layout from '../components/Layout'
import { Users, AlertCircle, BarChart3, RefreshCw, Database, TrendingUp, Lock } from 'lucide-react'

export default function AdminDashboard() {

  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [flaggedAttempts, setFlaggedAttempts] = useState([])

  useEffect(() => {
    loadAnalytics()
    loadFlaggedAttempts()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getSystemAnalytics()
      setAnalytics(response.data)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFlaggedAttempts = async () => {
    try {
      const response = await apiClient.getFlaggedAttempts(2.0)
      setFlaggedAttempts(response.data.flaggedAttempts || [])
    } catch (err) {
      console.error('Failed to load flagged attempts:', err)
    }
  }

  const statCards = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Quizzes', value: analytics?.totalQuizzes || 0, icon: BarChart3, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Attempts', value: analytics?.totalAttempts || 0, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Flagged Attempts', value: flaggedAttempts.length, icon: AlertCircle, color: 'from-red-500 to-red-600' },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Administration 🛡️
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor and manage the entire platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-gradient-to-br dark:bg-gradient-to-br rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`bg-gradient-to-r ${stat.color} p-1`}></div>
                <div className="bg-white dark:bg-gray-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                      <p className={`text-4xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <BarChart3 size={28} className="text-blue-600" />
              Key Metrics
            </h2>
            {!loading && analytics && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Recent Attempts (7 days)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">New quiz submissions</p>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {analytics.recentAttempts || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Average Score</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Across all quizzes</p>
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {analytics.averageScore || 0}%
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Proctoring Events</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(analytics.proctorEventCounts || {}).map(([event, count]: any) => (
                      <div key={event} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{event.replace(/-/g, ' ')}</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
              <Lock size={28} className="text-purple-600" />
              Admin Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
                <Users size={20} />
                Manage Users
              </button>
              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
                <AlertCircle size={20} />
                Review Flagged ({flaggedAttempts.length})
              </button>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
                <Database size={20} />
                System Settings
              </button>
              <button
                onClick={() => { loadAnalytics(); loadFlaggedAttempts(); }}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Flagged Attempts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <AlertCircle className="text-red-600" size={28} />
              Flagged Attempts ({flaggedAttempts.length})
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Suspicious quiz attempts requiring review</p>
          </div>
          <div className="overflow-x-auto">
            {flaggedAttempts.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 dark:text-gray-400 text-lg">No flagged attempts found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Student</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Quiz</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Suspicion</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Warnings</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Score</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedAttempts.map((attempt: any) => (
                    <tr
                      key={attempt.attemptId}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">{attempt.studentName}</td>
                      <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-400">{attempt.quizTitle}</td>
                      <td className="px-8 py-4 text-sm">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                          attempt.suspicionScore > 3 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        }`}>
                          {attempt.suspicionScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-bold text-gray-900 dark:text-white">{attempt.warnings}</td>
                      <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {attempt.finalScore !== null ? `${attempt.finalScore}%` : '—'}
                      </td>
                      <td className="px-8 py-4 text-sm">
                        <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
