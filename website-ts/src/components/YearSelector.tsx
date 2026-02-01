'use client'

import { IconCalendar } from '@/components/Icons'

interface YearSelectorProps {
    years: number[]
    selectedYear: number
    onChange: (year: number) => void
    className?: string
}

export default function YearSelector({
    years,
    selectedYear,
    onChange,
    className = '',
}: YearSelectorProps) {
    return (
        <div className={`flex flex-wrap items-center gap-3 ${className}`}>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <IconCalendar size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">Season:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => onChange(year)}
                        className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${selectedYear === year
                                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                            }
            `}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    )
}
