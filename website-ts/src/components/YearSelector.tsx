'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface YearSelectorProps {
  years: number[]
  selectedYear: number
  onChange: (year: number) => void
  className?: string
}

export default function YearSelector({ years, selectedYear, onChange, className = '' }: YearSelectorProps) {
  const { theme } = useTheme()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className={`
        text-sm font-medium
        ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
      `}>
        📅 Select Season
      </label>
      <select
        value={selectedYear}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          px-3 py-2 rounded-lg border outline-none transition-all duration-200
          focus:ring-2 focus:ring-blue-500/50
          ${theme === 'dark' 
            ? 'bg-[#21262d] border-[#30363d] text-[#f0f6fc]' 
            : 'bg-[#f6f8fa] border-[#d0d7de] text-[#1f2328]'
          }
        `}
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  )
}
