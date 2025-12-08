import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  photoURL?: string
  createdAt: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export interface Quiz {
  quizId: string
  title: string
  description?: string
  createdBy: string
  startTime: number
  endTime: number
  durationSeconds: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  adaptive: boolean
  proctoringEnabled: boolean
  maxAttempts: number
  passingScore: number
  questionIds: string[]
}

export interface QuizState {
  quizzes: Quiz[]
  selectedQuiz: Quiz | null
  setQuizzes: (quizzes: Quiz[]) => void
  addQuiz: (quiz: Quiz) => void
  updateQuiz: (quiz: Quiz) => void
  deleteQuiz: (quizId: string) => void
  selectQuiz: (quiz: Quiz | null) => void
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  selectedQuiz: null,
  setQuizzes: (quizzes: Quiz[]) => set({ quizzes }),
  addQuiz: (quiz: Quiz) => set((state) => ({ quizzes: [...state.quizzes, quiz] })),
  updateQuiz: (quiz: Quiz) =>
    set((state) => ({
      quizzes: state.quizzes.map((q) => (q.quizId === quiz.quizId ? quiz : q)),
    })),
  deleteQuiz: (quizId: string) =>
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q.quizId !== quizId),
    })),
  selectQuiz: (quiz: Quiz | null) => set({ selectedQuiz: quiz }),
}))

export interface Theme {
  isDark: boolean
  toggleDarkMode: () => void
}

export const useThemeStore = create<Theme>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-storage',
    }
  )
)
