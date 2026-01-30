'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Fantasy Football', path: '/fantasy-football', icon: '🏈' },
  ]

  const toggleButton = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
      className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
    >
      {collapsed ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>
  )

  const asideClass = "bg-[var(--bg-secondary)] border-[var(--border-color)]"

  if (collapsed) {
    return (
      <aside
        className={`
          flex-shrink-0 w-14 min-h-screen border-r flex flex-col items-center pt-4 transition-all duration-300 z-30
          fixed md:relative inset-y-0 left-0
          ${asideClass}
        `}
      >
        {toggleButton}
      </aside>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-20 md:hidden"
        onClick={onToggle}
        aria-hidden="true"
      />
      <aside
        className={`
          w-64 min-h-screen border-r flex flex-col flex-shrink-0 transition-all duration-300 z-30
          fixed md:relative inset-y-0 left-0
          ${asideClass}
        `}
      >
        <div className="p-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[var(--text-secondary)]">
            Navigation
          </h2>
          {toggleButton}
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => window.innerWidth < 768 && onToggle()}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }
              `}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
