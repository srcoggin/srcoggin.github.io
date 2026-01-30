'use client'

import { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import Tabs from '@/components/Tabs'
import FantasyHome from '@/components/tabs/FantasyHome'
import FantasyRadar from '@/components/tabs/FantasyRadar'
import DeepDive from '@/components/tabs/DeepDive'
import RookieTalk from '@/components/tabs/RookieTalk'
import { loadAllData } from '@/utils/dataLoader'
import { PlayerData } from '@/types'

export default function FantasyFootball() {
  const [data, setData] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allData = await loadAllData()
        if (allData.length === 0) {
          setError('No data loaded. Please check the data files.')
        } else {
          setData(allData)
        }
      } catch (err) {
        setError('Failed to load data. Please try refreshing the page.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 box-border">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--text-secondary)]">
            Loading data...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 box-border">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'home',
      label: '🏠 Fantasy Home',
      content: <FantasyHome data={data} />,
    },
    {
      id: 'rookie-talk',
      label: '🌟 Rookie Talk',
      content: <RookieTalk />,
    },
    {
      id: 'radar',
      label: '📊 Fantasy Radar',
      content: <FantasyRadar data={data} />,
    },
    {
      id: 'deep-dive',
      label: '🔎 Deep Dive Tool',
      content: <DeepDive data={data} />,
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 box-border">
      {/* Theme Toggle - Top Right */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 break-words text-[var(--text-primary)]">
        🏈 Fantasy Football Hub
      </h1>

      <Tabs tabs={tabs} defaultTab="home" />
    </div>
  )
}
