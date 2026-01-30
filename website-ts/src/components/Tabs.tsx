'use client'

import { useState, ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const { theme } = useTheme()

  const activeContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <div>
      <div className={`
        flex gap-1 border-b pb-0
        ${theme === 'dark' ? 'border-[#30363d]' : 'border-[#d0d7de]'}
      `}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-3 rounded-t-lg font-medium transition-all duration-200 border-b-2
              ${activeTab === tab.id
                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                : theme === 'dark'
                  ? 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                  : 'border-transparent text-[#57606a] hover:text-[#1f2328] hover:bg-[#eaeef2]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {activeContent}
      </div>
    </div>
  )
}
