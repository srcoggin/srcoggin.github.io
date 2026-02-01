'use client'

import { useState, ReactNode } from 'react'
import { IconChevronDown } from '@/components/Icons'

interface ExpanderProps {
  title: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export default function Expander({ title, children, defaultExpanded = false, className = '' }: ExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex justify-between items-center cursor-pointer transition-colors hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
      >
        <span className="font-medium flex items-center gap-2">{title}</span>
        <IconChevronDown
          size={18}
          className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          {children}
        </div>
      )}
    </div>
  )
}
