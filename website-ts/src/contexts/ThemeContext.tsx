'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Theme, DEFAULT_THEME, isValidTheme } from '@/utils/themeColors'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const defaultContext: ThemeContextType = {
  theme: DEFAULT_THEME,
  setTheme: () => {},
  mounted: false,
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved && isValidTheme(saved)) {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    const isDarkLike = ['dark', 'ocean', 'forest', 'amber'].includes(theme)
    document.documentElement.style.colorScheme = isDarkLike ? 'dark' : 'light'
  }, [theme, mounted])

  const setTheme = (next: Theme) => {
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      <div
        data-theme={theme}
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
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
