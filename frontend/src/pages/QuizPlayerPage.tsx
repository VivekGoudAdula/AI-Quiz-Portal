import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { apiClient } from '../api'
import Layout from '../components/Layout'
import { Clock, ChevronUp, ChevronDown, Flag, Send, Volume2, MessageCircle } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'mcq' | 'tf' | 'short_answer'
  options?: Array<{ id: string; text: string }>
  marks: number
  difficulty: string
}

interface Answer {
  questionId: string
  answer: string | string[]
  timeSpent: number
}

export default function QuizPlayerPage() {
  // Quiz & Question Data
  const [quiz, setQuiz] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)


  const { quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Ensure currentQuestionIndex is always valid when questions change
  useEffect(() => {
    if (questions.length > 0 && (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length)) {
      setCurrentQuestionIndex(0);
    }
  }, [questions]);

  // Timer & Timestamps
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const attemptStartTime = useRef(Date.now())

  // Answers & State
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map())
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [attemptId, setAttemptId] = useState<string>('')

  // UI State
  const [showQuestionNav, setShowQuestionNav] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Load quiz and start attempt
  useEffect(() => {
    loadQuizAndStartAttempt()
  }, [quizId])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const loadQuizAndStartAttempt = async () => {
    try {
      setLoading(true)

      // Get quiz details (includes questions)
      const quizResponse = await apiClient.getQuizDetail(quizId!)
      const quizData = quizResponse.data.quiz || quizResponse.data
      // Map qId to id for frontend compatibility
      let questions = (quizData.questions || []).map((q: any) => ({
        ...q,
        id: q.id || q.qId, // prefer id, fallback to qId
      }));
      console.log('Loaded quizData.questions:', questions);
      setQuiz(quizData)
      setQuestions(questions)
      setCurrentQuestionIndex(0)

      // Start attempt
      const attemptResponse = await apiClient.startQuizAttempt(quizId!)
      setAttemptId(attemptResponse.data.attemptId)

      // Set timer (convert seconds to milliseconds)
      setTimeRemaining(quizData.durationSeconds)
      setQuestionStartTime(Date.now())
    } catch (err) {
      console.error('Failed to load quiz:', err)
      alert('Failed to load quiz. Please try again.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  let currentAnswer = { answer: '', timeSpent: 0 };
  if (currentQuestion && currentQuestion.id) {
    const found = answers.get(currentQuestion.id);
    if (found) currentAnswer = found;
  }
  // Only log if currentQuestion is valid
  if (currentQuestion && currentQuestion.id) {
    console.log('Current answer for question', currentQuestion.id, ':', currentAnswer);
  }

  // Update answer for current question
  const handleAnswerChange = (value: string | string[]) => {
    if (!currentQuestion || !currentQuestion.id) {
      console.warn('handleAnswerChange called with no valid currentQuestion');
      return;
    }

    // For MCQ/TF, always store answer as string
    let answerValue: string | string[] = value;
    if ((currentQuestion.type === 'mcq' || currentQuestion.type === 'tf') && Array.isArray(value)) {
      answerValue = value[0] || '';
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, { questionId: currentQuestion.id, answer: answerValue, timeSpent });
      // Autosave with the latest value
      autoSaveAnswer(currentQuestion.id, answerValue, timeSpent);
      return updated;
    });
  }

  const autoSaveAnswer = async (questionId: string, answer: string | string[], timeSpent?: number) => {
    try {
      const payload = {
        questionId,
        answer: Array.isArray(answer) ? answer.join(',') : answer,
        timeSpent: timeSpent || 0,
        markedForReview: flaggedQuestions.has(questionId),
      };
      console.log('AutoSave Payload:', payload);
      await apiClient.saveQuizAnswer(attemptId, payload);
    } catch (err) {
      console.error('Autosave failed:', err)
    }
  }

  const toggleFlagQuestion = () => {
    if (!currentQuestion) return
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id)
    } else {
      newFlagged.add(currentQuestion.id)
    }
    setFlaggedQuestions(newFlagged)
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setQuestionStartTime(Date.now())
      setShowQuestionNav(false)
    }
  }

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true)

      // Save all answers one more time
      const answersArray = Array.from(answers.values())
      for (const ans of answersArray) {
        // Skip if questionId or answer is empty/null/undefined
        if (!ans.questionId || ans.answer === undefined || ans.answer === null || ans.answer === '') {
          console.warn('Skipping empty answer:', ans)
          continue;
        }
        const payload = {
          questionId: ans.questionId,
          answer: ans.answer,
          timeSpent: ans.timeSpent || 0,
          markedForReview: flaggedQuestions.has(ans.questionId),
        };
        console.log('Saving answer:', payload);
        await apiClient.saveQuizAnswer(attemptId, payload)
      }

      // Submit quiz
      const response = await apiClient.submitQuizAttempt(attemptId)

      // Navigate to results
      navigate(`/quiz/${quizId}/results/${attemptId}`, {
        state: { results: response.data },
      })
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getAnswerStatus = (questionId: string) => {
    if (flaggedQuestions.has(questionId)) return 'flagged'
    if (answers.has(questionId)) return 'answered'
    return 'unanswered'
  }

  const getAnswerColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white'
      case 'flagged':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-300 dark:bg-gray-600'
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

  if (!quiz || questions.length === 0) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl">No quiz found</p>
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

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-blue-100">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>

          <div className="flex items-center gap-8">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-red-500' : 'bg-blue-700'
            }`}>
              <Clock size={20} />
              <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Send size={18} />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto">
            {/* Question Header and Options */}
            {questions.length === 0 || !currentQuestion ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-xl py-16">
                No questions available for this quiz.
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentQuestion.text}
                    </h2>
                    <button
                      onClick={toggleFlagQuestion}
                      className={`p-3 rounded-lg transition ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-orange-600'
                      }`}
                      title="Mark for review"
                    >
                      <Flag size={20} fill={flaggedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      {currentQuestion.type.toUpperCase()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Marks: {currentQuestion.marks}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium capitalize">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                {/* Question Options */}
                <div className="space-y-4">
                  {currentQuestion.type === 'mcq' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option.id}
                            checked={String(currentAnswer.answer) === String(option.id)}
                            onChange={() => handleAnswerChange(option.id)}
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 cursor-pointer"
                          />
                          <span className="ml-4 text-gray-800 dark:text-gray-200">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'tf' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option.id}
                            checked={String(currentAnswer.answer) === String(option.id)}
                            onChange={() => handleAnswerChange(option.id)}
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 cursor-pointer"
                          />
                          <span className="ml-4 text-gray-800 dark:text-gray-200 font-medium">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'short_answer' && (
                    <textarea
                      value={typeof currentAnswer.answer === 'string' ? currentAnswer.answer : ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-48 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                    />
                  )}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              <button
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
              >
                <ChevronUp size={20} />
                Previous
              </button>

              <button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition font-medium"
              >
                Next
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Navigator */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                ✓ Answered ({answers.size})
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                🚩 Flagged ({flaggedQuestions.size})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const status = getAnswerStatus(q.id)
              const color = getAnswerColor(status)
              return (
                <button
                  key={`${q.id}-${idx}`}
                  onClick={() => goToQuestion(idx)}
                  className={`
                    aspect-square rounded-lg font-bold text-sm transition transform
                    ${idx === currentQuestionIndex
                      ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-110'
                      : 'hover:scale-105'
                    }
                    ${color}
                  `}
                  title={`Question ${idx + 1} - ${status}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">TOTAL QUESTIONS</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">ANSWERED</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{answers.size}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">FLAGGED FOR REVIEW</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{flaggedQuestions.size}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">UNANSWERED</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {questions.length - answers.size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
