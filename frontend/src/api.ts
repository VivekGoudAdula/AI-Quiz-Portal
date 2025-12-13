
import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://devserver-main--tourmaline-sprite-523e11.netlify.app/api'

class APIClient {
    getInstructorDashboardStats() {
      return this.client.get('/instructor/dashboard-stats');
    }
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable cookies for session auth
    })

    // Attach JWT token to every request if present
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('❌ 401 Unauthorized - Please log in')
        }
        return Promise.reject(error)
      }
    );
  }

  // Auth endpoints
  signup(name: string, email: string, password: string, role: string) {
    return this.client.post('/auth/signup', { name, email, password, role })
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  getCurrentUser() {
    return this.client.get('/auth/me')
  }

  updateProfile(name: string, photoURL?: string) {
    return this.client.put('/auth/profile', { name, photo_url: photoURL })
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.client.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword })
  }

  // Quiz endpoints
  getQuizzes(filter?: string) {
    return this.client.get('/quizzes', { params: { filter } })
  }

  getQuiz(quizId: string) {
    return this.client.get(`/quizzes/${quizId}`)
  }

  createQuiz(data: any) {
    return this.client.post('/quizzes', data)
  }

  updateQuiz(quizId: string, data: any) {
    return this.client.put(`/quizzes/${quizId}`, data)
  }

  deleteQuiz(quizId: string) {
    return this.client.delete(`/quizzes/${quizId}`)
  }

  addQuestionToQuiz(quizId: string, questionId: string) {
    return this.client.post(`/quizzes/${quizId}/questions`, { qId: questionId })
  }

  removeQuestionFromQuiz(quizId: string, questionId: string) {
    return this.client.delete(`/quizzes/${quizId}/questions/${questionId}`)
  }

  // Attempt endpoints
  startAttempt(quizId: string) {
    return this.client.post(`/attempts/${quizId}/start`)
  }

  saveAnswer(attemptId: string, questionId: string, answer: any, timeSpent: number, markedForReview: boolean) {
    return this.client.patch(`/attempts/${attemptId}/answer`, {
      questionId,
      answer,
      timeSpent,
      markedForReview,
    })
  }

  submitAttempt(attemptId: string) {
    return this.client.post(`/attempts/${attemptId}/submit`)
  }

  getAttemptResults(attemptId: string) {
    return this.client.get(`/attempts/${attemptId}/results`)
  }

  getAttemptHistory(userId: string) {
    return this.client.get(`/attempts/user/${userId}/history`)
  }

  // Proctoring endpoints
  logProctoringEvent(attemptId: string, eventType: string, meta?: any, severity?: string) {
    const payload = {
      eventType,
      timestamp: Date.now(),
      meta,
      severity,
    };
    console.log('[API] logProctoringEvent payload:', payload);
    return this.client.post(`/proctoring/${attemptId}/event`, payload);
  }

  getProctoringEvents(attemptId: string) {
    return this.client.get(`/proctoring/${attemptId}/events`)
  }

  logFaceDetection(attemptId: string, detections: any[], confidence: number) {
    return this.client.post(`/proctoring/${attemptId}/face-detection`, {
      detections,
      confidence,
    })
  }

  // Instructor endpoints
  createQuestion(data: any) {
    return this.client.post('/instructor/questions', data)
  }

  updateQuestion(questionId: string, data: any) {
    return this.client.put(`/instructor/questions/${questionId}`, data)
  }

  deleteQuestion(questionId: string) {
    return this.client.delete(`/instructor/questions/${questionId}`)
  }

  listQuestions(difficulty?: string, tag?: string) {
    return this.client.get('/instructor/questions', { params: { difficulty, tag } })
  }

  createQuestionOption(questionId: string, data: any) {
    return this.client.post(`/instructor/questions/${questionId}/options`, data)
  }

  getQuizAnalytics(quizId: string) {
    return this.client.get(`/instructor/analytics/${quizId}`)
  }

  // Admin endpoints
  listUsers(role?: string, search?: string) {
    return this.client.get('/admin/users', { params: { role, search } })
  }

  updateUserRole(userId: string, role: string) {
    return this.client.put(`/admin/users/${userId}/role`, { role })
  }

  getFlaggedAttempts(threshold?: number) {
    return this.client.get('/admin/flagged-attempts', { params: { threshold } })
  }

  flagAttempt(attemptId: string, reason: string) {
    return this.client.post(`/admin/attempts/${attemptId}/flag`, { reason })
  }

  getSystemAnalytics() {
    return this.client.get('/admin/analytics')
  }

  // Quiz Player endpoints
  startQuizAttempt(quizId: string) {
    return this.client.post(`/attempts/${quizId}/start`)
  }

  getQuizDetail(quizId: string) {
    return this.client.get(`/quizzes/${quizId}`)
  }

  getQuizQuestions(quizId: string) {
    return this.client.get(`/quizzes/${quizId}/questions`)
  }

  saveQuizAnswer(attemptId: string, answer: { questionId: string; answer: string }) {
    return this.client.patch(`/attempts/${attemptId}/answer`, answer)
  }

  submitQuizAttempt(attemptId: string) {
    return this.client.post(`/attempts/${attemptId}/submit`)
  }

  // Question Generation endpoints
  generateAIQuestions(topic: string, numQuestions: number, difficulty: string) {
    // Compose a prompt for Gemini to return a JSON array of MCQs
    const prompt = `Generate ${numQuestions} unique multiple choice questions on the topic '${topic}' with ${difficulty} difficulty. 
Return ONLY a JSON array, where each element is an object with the following fields: 'question', 'options' (an array of 4 strings), 'correct_answer' (the exact string from options), and 'explanation'.
Example:
[
  {"question": "What is 2+2?", "options": ["1", "2", "3", "4"], "correct_answer": "4", "explanation": "2+2=4."},
  ...
]
Do not include any text or formatting outside the JSON array.`;
    return this.client.post('/generate-questions', { prompt });
  }

  // Quiz Assignment endpoints
  assignQuizToStudents(quizId: string, studentIds: string[], dueDate: string) {
    return this.client.post(`/quizzes/${quizId}/assign`, {
      studentIds,
      dueDate,
    })
  }

  getAssignedQuizzes() {
    return this.client.get('/quizzes/student/assigned')
  }

  // Leaderboard endpoints
  getLeaderboard() {
    return this.client.get('/leaderboard')
  }

  getTopPerformers(limit: number = 10) {
    return this.client.get(`/leaderboard/top/${limit}`)
  }

  getMyRank() {
    return this.client.get('/leaderboard/my-rank')
  }
}

export const apiClient = new APIClient()
