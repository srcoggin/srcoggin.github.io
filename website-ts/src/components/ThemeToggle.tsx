'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { THEMES, type Theme } from '@/utils/themeColors'

export default function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] animate-pulse" />
    )
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[var(--bg-secondary)] border border-[var(--border-color)]
          text-[var(--text-primary)] hover:bg-[var(--bg-hover)]
          transition-colors duration-200
        "
        title="Theme"
        aria-label="Choose theme"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-lg" aria-hidden>{current.icon}</span>
        <span className="text-sm font-medium hidden sm:inline">Theme</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Theme options"
          className="
            absolute right-0 top-full mt-2 py-2 min-w-[160px] rounded-xl
            bg-[var(--bg-card)] border border-[var(--border-color)]
            shadow-lg z-50
          "
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={theme === t.id}
              onClick={() => {
                setTheme(t.id as Theme)
                setOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-left
                transition-colors
                ${theme === t.id
                  ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }
              `}
            >
              <span
                className="w-6 h-6 rounded-full border-2 border-[var(--border-color)] flex-shrink-0"
                style={{ backgroundColor: t.swatch }}
                aria-hidden
              />
              <span className="font-medium">{t.label}</span>
              <span className="text-lg ml-auto" aria-hidden>{t.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
