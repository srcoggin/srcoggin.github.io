'use client'

interface MetricProps {
  label: string
  value: string | number
  secondaryText?: string
  className?: string
}

export default function Metric({ label, value, secondaryText, className = '' }: MetricProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <span className="text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </span>
      {secondaryText && (
        <span className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
          <span className="shrink-0 size-3.5 flex items-center justify-center rounded-full border border-current text-[0.65rem] font-bold leading-none" aria-hidden>i</span>
          {secondaryText}
        </span>
      )}
    </div>
  )
}
