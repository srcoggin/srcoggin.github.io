'use client'

interface DividerProps {
  className?: string
}

export default function Divider({ className = '' }: DividerProps) {
  return (
    <hr
      className={`w-full h-px my-6 border-0 bg-[var(--border-color)] ${className}`}
    />
  )
}
