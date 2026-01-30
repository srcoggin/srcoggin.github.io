'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

// Default context with dark theme for SSR
const defaultContext: ThemeContextType = {
  theme: 'dark',
  toggleTheme: () => {},
  mounted: false,
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // On mount, read from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  // When theme changes, update localStorage and document classes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      // Update document classes for CSS theme selectors
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(theme)
      // Also update color-scheme for native elements
      document.documentElement.style.colorScheme = theme
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = { theme, toggleTheme, mounted }

  return (
    <ThemeContext.Provider value={value}>
      <div 
        data-theme={theme}
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: theme === 'dark' ? '#0e1117' : '#ffffff',
          color: theme === 'dark' ? '#f0f6fc' : '#1f2328',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.1s ease-in-out, background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
