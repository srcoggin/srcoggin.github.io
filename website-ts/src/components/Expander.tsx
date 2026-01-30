'use client'

import { useState, ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ExpanderProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export default function Expander({ title, children, defaultExpanded = false, className = '' }: ExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { theme } = useTheme()

  return (
    <div className={`
      rounded-lg border overflow-hidden
      ${theme === 'dark' 
        ? 'border-[#30363d] bg-[#21262d]' 
        : 'border-[#d0d7de] bg-[#f6f8fa]'
      }
      ${className}
    `}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full px-4 py-3 flex justify-between items-center cursor-pointer transition-colors
          ${theme === 'dark' 
            ? 'hover:bg-[#30363d]' 
            : 'hover:bg-[#eaeef2]'
          }
        `}
      >
        <span className="font-medium">{title}</span>
        <span className={`
          text-sm transition-transform duration-200
          ${isExpanded ? 'rotate-180' : 'rotate-0'}
        `}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          {children}
        </div>
      )}
    </div>
  )
}
