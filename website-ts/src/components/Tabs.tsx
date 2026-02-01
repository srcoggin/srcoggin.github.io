'use client'

import { useState, ReactNode } from 'react'

interface Tab {
  id: string
  label: ReactNode
  content: ReactNode
  description?: string  // Optional description for the tab
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const activeTabData = tabs.find(t => t.id === activeTab)
  const activeContent = activeTabData?.content
  const activeDescription = activeTabData?.description

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
              flex-shrink-0 flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-t-lg font-medium transition-all duration-200 border-b-2 text-sm sm:text-base
              ${activeTab === tab.id
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description (if provided) */}
      {activeDescription && (
        <div className="mt-4 px-1">
          <p className="text-sm text-[var(--text-secondary)] italic border-l-2 border-[var(--accent-primary)]/50 pl-3">
            {activeDescription}
          </p>
        </div>
      )}

      <div className={`${activeDescription ? 'pt-4' : 'pt-4 sm:pt-6'} min-w-0`}>
        {activeContent}
      </div>
    </div>
  )
}

