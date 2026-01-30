'use client'

import { useState, ReactNode } from 'react'

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
  const activeContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <div className="min-w-0 w-full">
      <div
        className="flex gap-1 border-b pb-0 overflow-x-auto overflow-y-hidden border-[var(--border-color)]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-3 rounded-t-lg font-medium transition-all duration-200 border-b-2 text-sm sm:text-base
              ${activeTab === tab.id
                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4 sm:pt-6 min-w-0">
        {activeContent}
      </div>
    </div>
  )
}
