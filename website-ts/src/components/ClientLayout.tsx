'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen w-full min-w-0">
        {/* Header – full width with padding */}
        <header className="flex-shrink-0 h-14 border-b border-[var(--border-color)] bg-[var(--header-bg)] flex items-center justify-between px-4 md:px-6 z-40">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/Logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded flex-shrink-0"
            />
            <span className="font-bold text-base sm:text-lg text-[var(--text-primary)] truncate">
              The Expert Football
            </span>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 min-w-0 min-h-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
          />
          <main className={`flex-1 min-w-0 overflow-auto w-full flex flex-col ${sidebarCollapsed ? 'pl-14 md:pl-0' : 'md:pl-0'}`}>
            {children}
          </main>
        </div>

        {/* Footer – PFF/ESPN-style: News, Tools, About (PARC: Repetition) */}
        <footer className="flex-shrink-0 border-t border-[var(--border-color)] bg-[var(--header-bg)] mt-auto">
          <div className="content-width py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <p className="section-label mb-3">News &amp; Updates</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/#updates" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                      What&apos;s New
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="section-label mb-3">Tools</p>
                <ul className="space-y-2">
                  <li>
                    <Link href="/fantasy-football" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                      Fantasy Football Hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/fantasy-football#tabs" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                      Deep Dive &amp; Radar
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="section-label mb-3">About</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Advanced sports analytics powered by NFLVerse. Built for fantasy and draft analysis.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-[var(--text-muted)]">
                © {new Date().getFullYear()} The Expert Football. All rights reserved.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
