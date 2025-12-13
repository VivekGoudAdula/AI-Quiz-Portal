import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { apiClient } from '../api'
import Layout from '../components/Layout'
import AttemptProctoringLog from '../components/AttemptProctoringLog'
import { Download, BarChart3, Clock, CheckCircle, XCircle, Flag, Share2, Home } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: string
  options?: Array<{ id: string; text: string; isCorrect?: boolean }>
  marks: number
  correctAnswer?: string | string[]
}

interface Answer {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
  marks: number
}

interface ResultData {
	attemptId: string
	quizId: string
	userId: string
	startTime: number
	endTime: number
	finalScore: number
	totalMarks: number
	answers: Answer[]
	questions: Question[]
	warnings: number
	suspicionScore: number
}

export default function ResultPage() {
  const { quizId, attemptId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [result, setResult] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  // Make answers and questions arrays available throughout the component
  const answers = result && Array.isArray(result.answers) ? result.answers : [];
  const questions = result && Array.isArray(result.questions) ? result.questions : [];

  // Fallbacks for missing or incomplete result
  const finalScore = result && typeof result.finalScore === 'number' ? result.finalScore : 0;
  const totalMarks = result && typeof result.totalMarks === 'number' ? result.totalMarks : 0;
  const suspicionScore = result && typeof result.suspicionScore === 'number' ? result.suspicionScore : 0;
  // Security score: higher is better (based only on proctoring)
  const securityScore = Math.max(0, Math.min(1, 1 - suspicionScore));
  const warnings = result && typeof result.warnings === 'number' ? result.warnings : 0;
  const startTime = result && typeof result.startTime === 'number' ? result.startTime : null;
  const endTime = result && typeof result.endTime === 'number' ? result.endTime : null;

  useEffect(() => {
    loadResults()
  }, [attemptId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAttemptResults(attemptId!)
      // Use .results from backend response
      setResult(response.data.results)
    } catch (err) {
      console.error('Failed to load results:', err)
      alert('Failed to load results. Please try again.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  if (!result) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">Results not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  const percentage = totalMarks > 0 ? Math.min(100, Math.round((finalScore / totalMarks) * 100)) : 0;
  const timeTaken = startTime !== null && endTime !== null ? Math.floor((endTime - startTime) / 1000) : 0;
  const minutes = !isNaN(timeTaken) ? Math.floor(timeTaken / 60) : 0;
  const seconds = !isNaN(timeTaken) ? timeTaken % 60 : 0;

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = answers.filter((a) => a.isCorrect === false).length;
  const averageTimePerQuestion = answers.length > 0 && !isNaN(timeTaken) ? Math.round(timeTaken / answers.length) : 0;

  // Calculate accuracy and incorrect percentage
  const accuracy = answers.length ? ((correctAnswers / answers.length) * 100).toFixed(0) : 0;
  const incorrectPercent = answers.length ? ((incorrectAnswers / answers.length) * 100).toFixed(0) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20'
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20'
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! 🌟'
    if (score >= 80) return 'Excellent! ✨'
    if (score >= 70) return 'Good work! 👍'
    if (score >= 60) return 'Satisfactory 📚'
    if (score >= 50) return 'Needs improvement 💪'
    return 'Please try again 🔄'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Score Card */}
          <div className={`${getScoreBgColor(percentage)} rounded-2xl shadow-xl p-12 mb-8 border-l-4 ${
            percentage >= 80 ? 'border-green-500' : percentage >= 60 ? 'border-blue-500' : 'border-orange-500'
          }`}>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">YOUR SCORE</p>
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-300 dark:text-gray-700"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(percentage / 100) * 440} 440`}
                      className={`${getScoreColor(percentage)} transition-all duration-1000`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {finalScore}/{totalMarks}
                      </span>
                  </div>
                </div>
              </div>

              <h1 className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
                {getPerformanceMessage(percentage)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Quiz Completed Successfully</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">CORRECT ANSWERS</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{correctAnswers}</p>
                </div>
                <CheckCircle size={32} className="text-green-600 dark:text-green-400 opacity-20" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {accuracy}% accuracy
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">INCORRECT ANSWERS</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{incorrectAnswers}</p>
                </div>
                <XCircle size={32} className="text-red-600 dark:text-red-400 opacity-20" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {incorrectPercent}% incorrect
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">TIME TAKEN</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {minutes}m {seconds}s
                  </p>
                </div>
                <Clock size={32} className="text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Avg {averageTimePerQuestion}s per question
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">SECURITY SCORE</p>
                  <p className={`text-3xl font-bold mt-2 ${
                    securityScore >= 0.7 ? 'text-green-600 dark:text-green-400' : securityScore >= 0.4 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {(securityScore * 100).toFixed(0)}%
                  </p>
                </div>
                <Flag size={32} className="opacity-20" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {warnings} warning(s) detected
              </p>
            </div>
          </div>

          {/* Answer Review */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BarChart3 size={28} className="text-blue-600" />
              Answer Review
            </h2>

            <div className="space-y-4">
              {answers.map((answer, idx) => {
                const question = questions.find((q) => q.id === answer.questionId);
                const isExpanded = expandedQuestion === answer.questionId;

                return (
                  <div
                    key={answer.questionId}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <button
                      onClick={() =>
                        setExpandedQuestion(isExpanded ? null : answer.questionId)
                      }
                      className={`w-full p-4 flex items-center justify-between ${
                        answer.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {question?.text}
                          </p>
                          <p className={`text-sm mt-1 ${
                            answer.isCorrect
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'} • {answer.marks} marks • {answer.timeSpent}s
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            YOUR ANSWER:
                          </p>
                          <p className="text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            {/* Always show user's answer as text for MCQ/TF */}
                            {(() => {
                              if (question?.options && answer.userAnswer) {
                                // If userAnswer is an ID, map to text
                                const selected = question.options.find(opt => opt.id === answer.userAnswer || opt.text === answer.userAnswer);
                                return selected ? selected.text : answer.userAnswer;
                              }
                              return answer.userAnswer;
                            })()}
                          </p>
                        </div>

                        {question?.type !== 'short_answer' && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              CORRECT ANSWER:
                            </p>
                            <p className="text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                              {/* Always show correct answer as text for MCQ/TF */}
                              {(() => {
                                if (question?.options && question.correctAnswer) {
                                  const correct = question.options.find(opt => opt.id === question.correctAnswer || opt.text === question.correctAnswer);
                                  return correct ? correct.text : question.correctAnswer;
                                }
                                return question?.correctAnswer;
                              })()}
                            </p>
                          </div>
                        )}

                        {question?.type === 'mcq' && question?.options && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              ALL OPTIONS:
                            </p>
                            <div className="space-y-2">
                              {question.options.map((opt) => {
                                const isSelected = answer.userAnswer === opt.id || (Array.isArray(answer.userAnswer) && answer.userAnswer.includes(opt.id));
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2 rounded border flex items-center gap-2 ${
                                      opt.isCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : isSelected
                                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                          : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <p className="text-sm flex-1">
                                      {opt.text}
                                      {opt.isCorrect && (
                                        <span className="ml-2 text-green-600 dark:text-green-400 font-bold">✓</span>
                                      )}
                                      {isSelected && !opt.isCorrect && (
                                        <span className="ml-2 text-red-600 dark:text-red-400 font-bold">✗</span>
                                      )}
                                    </p>
                                    {isSelected && (
                                      <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">Your Choice</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Show correct/wrong for TF as well */}
                        {question?.type === 'tf' && question?.options && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              ALL OPTIONS:
                            </p>
                            <div className="space-y-2">
                              {question.options.map((opt) => {
                                const isSelected = answer.userAnswer === opt.id || (Array.isArray(answer.userAnswer) && answer.userAnswer.includes(opt.id));
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2 rounded border flex items-center gap-2 ${
                                      opt.isCorrect
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : isSelected
                                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                          : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <p className="text-sm flex-1">
                                      {opt.text}
                                      {opt.isCorrect && (
                                        <span className="ml-2 text-green-600 dark:text-green-400 font-bold">✓</span>
                                      )}
                                      {isSelected && !opt.isCorrect && (
                                        <span className="ml-2 text-red-600 dark:text-red-400 font-bold">✗</span>
                                      )}
                                    </p>
                                    {isSelected && (
                                      <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">Your Choice</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Home size={20} />
              Back to Dashboard
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
            >
              <Download size={20} />
              Download PDF
            </button>

            <button
              onClick={() => alert('Share functionality coming soon!')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
            >
              <Share2 size={20} />
              Share Results
            </button>
          </div>

          {/* Proctoring Violation Timeline */}
          <AttemptProctoringLog attemptId={attemptId!} />

          {/* Footer Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Completed on{' '}
              <span className="font-semibold">
                {endTime ? (() => {
                  const dateObj = new Date(endTime);
                  const dateStr = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const timeStr = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                  return `${dateStr} at ${timeStr}`;
                })() : 'N/A'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
