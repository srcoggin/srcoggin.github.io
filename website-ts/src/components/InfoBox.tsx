'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface InfoBoxProps {
  type: 'info' | 'success' | 'warning' | 'error'
  children: ReactNode
  className?: string
}

export default function InfoBox({ type, children, className = '' }: InfoBoxProps) {
  const { theme } = useTheme()
  
  const typeStyles = {
    info: {
      border: '#58a6ff',
      bg: theme === 'dark' ? 'rgba(88, 166, 255, 0.1)' : 'rgba(9, 105, 218, 0.1)',
    },
    success: {
      border: theme === 'dark' ? '#3fb950' : '#1a7f37',
      bg: theme === 'dark' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(26, 127, 55, 0.1)',
    },
    warning: {
      border: theme === 'dark' ? '#d29922' : '#9a6700',
      bg: theme === 'dark' ? 'rgba(210, 153, 34, 0.1)' : 'rgba(154, 103, 0, 0.1)',
    },
    error: {
      border: theme === 'dark' ? '#f85149' : '#cf222e',
      bg: theme === 'dark' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(207, 34, 46, 0.1)',
    },
  }

  const style = typeStyles[type]

  return (
    <div 
      className={`px-4 py-3 rounded-lg border-l-4 ${className}`}
      style={{
        borderLeftColor: style.border,
        backgroundColor: style.bg,
      }}
    >
      {children}
    </div>
  )
}
