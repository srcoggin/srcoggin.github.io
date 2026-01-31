'use client'

import { useState, useEffect } from 'react'
import Tabs from '@/components/Tabs'
import FantasyHome from '@/components/tabs/FantasyHome'
import FantasyRadar from '@/components/tabs/FantasyRadar'
import DeepDive from '@/components/tabs/DeepDive'
import RookieTalk from '@/components/tabs/RookieTalk'
import { IconHome, IconRookie, IconRadar, IconDeepDive } from '@/components/Icons'
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
      <div className="content-width py-6 sm:py-8 flex-1">
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
      <div className="content-width py-6 sm:py-8 flex-1">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-[var(--accent-red)]">{error}</div>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'home',
      label: <><IconHome size={18} className="flex-shrink-0" /> Fantasy Home</>,
      content: <FantasyHome data={data} />,
    },
    {
      id: 'rookie-talk',
      label: <><IconRookie size={18} className="flex-shrink-0" /> Rookie Talk</>,
      content: <RookieTalk />,
    },
    {
      id: 'radar',
      label: <><IconRadar size={18} className="flex-shrink-0" /> Fantasy Radar</>,
      content: <FantasyRadar data={data} />,
    },
    {
      id: 'deep-dive',
      label: <><IconDeepDive size={18} className="flex-shrink-0" /> Deep Dive Tool</>,
      content: <DeepDive data={data} />,
    },
  ]

  return (
    <div className="content-width py-6 sm:py-8 flex-1" id="tabs">
      <p className="section-label">Tools</p>
      <h1 className="page-title break-words">
        Fantasy Football Hub
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Player grades, draft prospects, and fantasy analysis. Pick a tab below.
      </p>

      <Tabs tabs={tabs} defaultTab="home" />
    </div>
  )
}
