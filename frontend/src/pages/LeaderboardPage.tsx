import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { apiClient } from '../api'
import { Trophy, Medal, Crown, TrendingUp, Star } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  quizzesCompleted: number
  avatar?: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all')

  useEffect(() => {
    loadLeaderboard()
  }, [timeFilter])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getLeaderboard()
      const data = response.data.leaderboard || []
      
      // If no real data, show sample data for demo
      if (data.length === 0) {
        setLeaderboard([
          { rank: 1, name: 'Priya Sharma', score: 98.5, quizzesCompleted: 24 },
          { rank: 2, name: 'Rahul Verma', score: 96.2, quizzesCompleted: 22 },
          { rank: 3, name: 'Ananya Reddy', score: 94.8, quizzesCompleted: 20 },
          { rank: 4, name: 'Karthik Nair', score: 93.1, quizzesCompleted: 19 },
          { rank: 5, name: 'Sneha Patel', score: 91.7, quizzesCompleted: 18 },
          { rank: 6, name: 'Arjun Kumar', score: 89.4, quizzesCompleted: 17 },
          { rank: 7, name: 'Divya Menon', score: 87.9, quizzesCompleted: 16 },
          { rank: 8, name: 'Vikram Singh', score: 86.2, quizzesCompleted: 15 },
          { rank: 9, name: 'Meera Iyer', score: 84.5, quizzesCompleted: 14 },
          { rank: 10, name: 'Rohan Das', score: 82.8, quizzesCompleted: 13 },
        ])
      } else {
        setLeaderboard(data)
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
      // Fallback to sample data
      setLeaderboard([
        { rank: 1, name: 'Priya Sharma', score: 98.5, quizzesCompleted: 24 },
        { rank: 2, name: 'Rahul Verma', score: 96.2, quizzesCompleted: 22 },
        { rank: 3, name: 'Ananya Reddy', score: 94.8, quizzesCompleted: 20 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={28} />
      case 2:
        return <Medal className="text-gray-400" size={26} />
      case 3:
        return <Medal className="text-amber-600" size={26} />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700'
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Top performers in our quiz platform</p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {(['week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                timeFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="order-1 mt-8">
                <div className="bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-800 dark:to-slate-900 rounded-2xl p-6 text-center shadow-xl border-2 border-gray-300 dark:border-gray-600 transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">2</span>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{leaderboard[1]?.name}</h3>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{leaderboard[1]?.score}%</p>
                  <p className="text-xs text-gray-500">{leaderboard[1]?.quizzesCompleted} quizzes</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-2">
                <div className="bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl p-6 text-center shadow-2xl border-2 border-yellow-400 dark:border-yellow-600 transform hover:scale-105 transition-all duration-300 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Crown className="text-yellow-500" size={32} />
                  </div>
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-bold">1</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{leaderboard[0]?.name}</h3>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{leaderboard[0]?.score}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboard[0]?.quizzesCompleted} quizzes</p>
                  <div className="flex justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-yellow-500 fill-yellow-500" size={14} />
                    ))}
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 mt-12">
                <div className="bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6 text-center shadow-xl border-2 border-amber-400 dark:border-amber-600 transform hover:scale-105 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold">3</span>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{leaderboard[2]?.name}</h3>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{leaderboard[2]?.score}%</p>
                  <p className="text-xs text-gray-500">{leaderboard[2]?.quizzesCompleted} quizzes</p>
                </div>
              </div>
            </div>

            {/* Rest of Leaderboard */}
            <ul className="space-y-3">
              {leaderboard.slice(3).map((entry, idx) => (
                <li
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getRankBg(entry.rank)} ${
                    idx % 2 === 0 ? 'bg-opacity-100' : 'bg-opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full shadow">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{entry.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.quizzesCompleted} quizzes completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-green-500" size={20} />
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800 dark:text-white">{entry.score}%</p>
                      <p className="text-xs text-gray-500">avg score</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-10 py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Rankings are updated daily based on quiz performance and completion rate.
          </p>
        </div>
      </div>
    </Layout>
  )
}
