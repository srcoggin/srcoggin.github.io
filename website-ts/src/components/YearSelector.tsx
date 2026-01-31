'use client'

import { IconCalendar } from '@/components/Icons'

interface YearSelectorProps {
  years: number[]
  selectedYear: number
  onChange: (year: number) => void
  className?: string
}

export default function YearSelector({ years, selectedYear, onChange, className = '' }: YearSelectorProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
        <IconCalendar size={18} className="flex-shrink-0" />
        Select Season
      </label>
      <select
        value={selectedYear}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-primary)]/50"
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  )
}
