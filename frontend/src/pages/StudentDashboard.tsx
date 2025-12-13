import { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import Layout from '../components/Layout'
import { AssignedQuizzes } from '../components/AssignedQuizzes'
import { apiClient } from '../api'
import { Clock, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    available: 0,
    completed: 0,
    avgScore: 0,
    totalTime: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await apiClient.getAssignedQuizzes()
      const quizzes = response.data.quizzes || []
      
      const now = new Date()
      const available = quizzes.filter((q: any) => {
        const start = new Date(q.startTime)
        const end = new Date(q.endTime)
        return start <= now && end > now
      }).length
      
      const completed = quizzes.filter((q: any) => q.attempted).length
      
      const attemptedQuizzes = quizzes.filter((q: any) => q.attempted && q.score !== undefined)
      const avgScore = attemptedQuizzes.length > 0 
        ? attemptedQuizzes.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / attemptedQuizzes.length
        : 0
      
      setStats({
        available,
        completed,
        avgScore: Math.round(avgScore),
        totalTime: completed * 0.5 // Estimate 30 min per quiz
      })
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const statCards = [
    { label: 'Available Quizzes', value: stats.available.toString(), icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Time', value: `${stats.totalTime}h`, icon: Clock, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Ready to take your next challenge? Let's get started!</p>
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
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4`}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Your Assigned Quizzes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Assigned Quizzes</h2>
          <AssignedQuizzes />
        </div>
      </div>
    </Layout>
  )
}
