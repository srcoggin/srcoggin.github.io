'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-600/20 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 text-xl
        ${theme === 'dark' 
          ? 'bg-gray-700/50 hover:bg-gray-600/70 text-yellow-300' 
          : 'bg-gray-200/70 hover:bg-gray-300/90 text-blue-600'
        }
      `}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
