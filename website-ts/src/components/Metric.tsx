'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface MetricProps {
  label: string
  value: string | number
  className?: string
}

export default function Metric({ label, value, className = '' }: MetricProps) {
  const { theme } = useTheme()

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`
        text-sm font-medium
        ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
      `}>
        {label}
      </span>
      <span className={`
        text-2xl font-bold
        ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
      `}>
        {value}
      </span>
    </div>
  )
}
