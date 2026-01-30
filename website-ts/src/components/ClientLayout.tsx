'use client'

import { ReactNode, useState } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Sidebar from '@/components/Sidebar'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full min-w-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
        <main className={`flex-1 min-w-0 overflow-auto w-full ${sidebarCollapsed ? 'pl-14 md:pl-0' : 'md:pl-0'}`}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
