'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Sidebar from '@/components/Sidebar'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
