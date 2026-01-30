'use client'

import { ReactNode } from 'react'

interface InfoBoxProps {
  type: 'info' | 'success' | 'warning' | 'error'
  children: ReactNode
  className?: string
}

export default function InfoBox({ type, children, className = '' }: InfoBoxProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-l-4 info-box ${type} ${className}`}>
      {children}
    </div>
  )
}
