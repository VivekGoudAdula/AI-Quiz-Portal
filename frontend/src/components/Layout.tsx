import { ReactNode } from 'react'
import { useThemeStore } from '../store'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  showFooter?: boolean
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  const { isDark } = useThemeStore()

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header />
        <main className="flex-1 pt-4">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>
        {showFooter && <Footer />}
      </div>
    </div>
  )
}
