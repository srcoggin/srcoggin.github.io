'use client'

interface MetricProps {
  label: string
  value: string | number
  className?: string
}

export default function Metric({ label, value, className = '' }: MetricProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <span className="text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  )
}
