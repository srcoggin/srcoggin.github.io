'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface DividerProps {
  className?: string
}

export default function Divider({ className = '' }: DividerProps) {
  const { theme } = useTheme()

  return (
    <hr 
      className={`
        w-full h-px my-6 border-0
        ${theme === 'dark' ? 'bg-[#30363d]' : 'bg-[#d0d7de]'}
        ${className}
      `}
    />
  )
}
