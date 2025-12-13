import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import { apiClient } from '../api'
import Layout from '../components/Layout'
import { GenerateQuestions } from '../components/GenerateQuestions'
import { AssignQuiz } from '../components/AssignQuiz'
import { Plus, Edit2, Trash2, BarChart3, BookOpen, Users, TrendingUp, Clock, Zap, Send } from 'lucide-react'

export default function InstructorDashboard() {
  const { user } = useAuthStore()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    avgPerformance: 0,
    activeQuizzes: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'quizzes' | 'generate' | 'assign'>('quizzes')
  const [selectedQuizForAssign, setSelectedQuizForAssign] = useState<any | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationSeconds: 3600,
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 172800000,
    maxAttempts: 1,
    passingScore: 40,
  })


  useEffect(() => {
    loadQuizzes();
    loadDashboardStats();
  }, [])

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.getInstructorDashboardStats();
      setDashboardStats(response.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getQuizzes('all')
      console.log('Loaded quizzes:', response.data.quizzes)
      setQuizzes(response.data.quizzes || [])
    } catch (err) {
      console.error('Failed to load quizzes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.createQuiz(formData)
      setQuizzes([...quizzes, response.data.quiz])
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        durationSeconds: 3600,
        startTime: Date.now() + 86400000,
        endTime: Date.now() + 172800000,
        maxAttempts: 1,
        passingScore: 40,
      })
    } catch (err) {
      console.error('Failed to create quiz:', err)
      alert('Failed to create quiz. Please try again.')
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await apiClient.deleteQuiz(quizId)
        setQuizzes(quizzes.filter(q => q.quizId !== quizId))
      } catch (err) {
        console.error('Failed to delete quiz:', err)
        alert('Failed to delete quiz. Please try again.')
      }
    }
  }

  const statCards = [
    { label: 'Total Quizzes', value: dashboardStats.totalQuizzes, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Students', value: dashboardStats.totalStudents, icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Avg Performance', value: `${dashboardStats.avgPerformance}%`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Active Quizzes', value: dashboardStats.activeQuizzes, icon: Clock, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user?.name}! 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Create and manage your quizzes</p>
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

        {/* Tabs */}
        <div className="mb-8">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 shadow-inner">
            {([
              { key: 'quizzes', label: 'Manage Quizzes', icon: BookOpen },
              { key: 'generate', label: 'AI Question Generator', icon: Zap },
              { key: 'assign', label: 'Assign Quiz', icon: Send },
            ] as const).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300'
                  }`}
                  title={tab.label}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'quizzes' && (
          <>
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Quizzes</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition transform hover:scale-105"
              >
                <Plus size={20} />
                Create New Quiz
              </button>
            </div>

        {/* Create Quiz Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="e.g., Midterm: DBMS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Quiz description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      value={formData.durationSeconds}
                      onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) })}
                      required
                      placeholder="e.g., 3600"
                      title="Enter quiz duration in seconds"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Attempts</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxAttempts}
                      onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                      required
                      placeholder="e.g., 1"
                      title="Enter maximum attempts allowed"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseFloat(e.target.value) })}
                      placeholder="e.g., 40"
                      title="Enter passing score percentage"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Create Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quizzes Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No quizzes created yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz: any) => {
                const now = Date.now()
                const isActive = quiz.startTime <= now && quiz.endTime >= now
                const isUpcoming = quiz.startTime > now
                return (
                  <div
                    key={quiz.quizId}
                    className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
                  >
                    {/* Header Bar */}
                    <div className={`h-2 bg-gradient-to-r ${isActive ? 'from-green-500 to-green-600' : isUpcoming ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'}`}></div>

                    <div className="p-6">
                      {/* Status Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          isUpcoming ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {isActive ? '🔴 ACTIVE' : isUpcoming ? '📅 UPCOMING' : '✓ ENDED'}
                        </span>
                      </div>

                      {/* Quiz Info */}
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {quiz.description || 'No description provided'}
                      </p>

                      {/* Meta Information */}
                      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <BookOpen size={16} />
                          <span>{quiz.questionIds?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock size={16} />
                          <span>{Math.floor(quiz.durationSeconds / 60)}m</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users size={16} />
                          <span>Max {quiz.maxAttempts} attempt(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <TrendingUp size={16} />
                          <span>Pass: {quiz.passingScore}%</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          title="View Analytics"
                          className="flex-1 p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition font-medium flex items-center justify-center gap-2"
                        >
                          <BarChart3 size={18} />
                          Analytics
                        </button>
                        <button
                          title="Edit Quiz"
                          className="flex-1 p-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg transition font-medium flex items-center justify-center gap-2"
                        >
                          <Edit2 size={18} />
                          Edit
                        </button>
                        <button
                          title="Delete Quiz"
                          onClick={() => handleDeleteQuiz(quiz.quizId)}
                          className="flex-1 p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition font-medium flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
          </>
        )}

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GenerateQuestions 
              onQuestionsGenerated={setGeneratedQuestions}
              quizzes={quizzes}
              onQuestionsAdded={() => {
                loadQuizzes()
              }}
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Generated Questions</h3>
                <span className="text-sm text-gray-500">{generatedQuestions.length} ready</span>
              </div>
              {generatedQuestions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Generate questions to preview them here.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Q{idx + 1}. {q.text || q.question || 'Question text'}</p>
                      {q.options && Array.isArray(q.options) && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {q.options.map((opt: any, i: number) => {
                            // Check both isCorrect (from backend) and is_correct (from AI generation)
                            const isCorrect = opt.isCorrect === true || opt.is_correct === true
                            return (
                              <li key={i} className={`flex items-center justify-between rounded px-2 py-1 ${isCorrect ? 'text-green-700 dark:text-green-300 font-semibold bg-green-100 dark:bg-green-900/30' : ''}`}>
                                <span>{String.fromCharCode(65 + i)}. {opt.text || opt}</span>
                                {isCorrect && <span className="text-green-700 dark:text-green-300 font-bold ml-2">✓ CORRECT</span>}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select a Quiz to Assign</h3>
              <p className="text-sm text-gray-500 mb-3">Choose a quiz and assign it to students with a due date.</p>

              <div className="space-y-3">
                {quizzes.length === 0 ? (
                  <p className="text-gray-500">No quizzes available. Create a quiz first.</p>
                ) : (
                  quizzes.map((quiz) => (
                    <label
                      key={quiz.quizId}
                      className={`block border rounded-lg p-3 cursor-pointer transition ${
                        selectedQuizForAssign?.quizId === quiz.quizId
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quiz-select"
                        className="mr-3 accent-blue-600"
                        checked={selectedQuizForAssign?.quizId === quiz.quizId}
                        onChange={() => setSelectedQuizForAssign(quiz)}
                        title={`Select ${quiz.title}`}
                        aria-label={`Select quiz ${quiz.title}`}
                      />
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{quiz.title}</span>
                      <span className="ml-2 text-xs text-gray-500">{quiz.questionIds?.length || 0} questions</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              {selectedQuizForAssign ? (
                <AssignQuiz
                  quizId={selectedQuizForAssign.quizId}
                  quizTitle={selectedQuizForAssign.title}
                  onAssignmentComplete={() => {
                    setActiveTab('quizzes')
                    loadQuizzes()
                  }}
                />
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-green-100 dark:border-gray-700 h-full flex items-center justify-center text-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Select a quiz to assign</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Choose a quiz from the list to start assigning it to students.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
