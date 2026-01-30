'use client'

import { useMemo } from 'react'
import Metric from '@/components/Metric'
import Divider from '@/components/Divider'
import InfoBox from '@/components/InfoBox'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData } from '@/types'

interface FantasyHomeProps {
  data: PlayerData[]
}

export default function FantasyHome({ data }: FantasyHomeProps) {
  const { theme } = useTheme()

  // Find the latest year
  const latestYear = useMemo(() => {
    return Math.max(...data.map(d => d.season))
  }, [data])

  // Filter data for the latest year
  const yearData = useMemo(() => {
    return data.filter(d => d.season === latestYear)
  }, [data, latestYear])

  // Calculate stats
  const stats = useMemo(() => {
    // Group by player and sum fantasy points
    const playerTotals: Record<string, number> = {}
    for (const row of yearData) {
      if (!playerTotals[row.player_display_name]) {
        playerTotals[row.player_display_name] = 0
      }
      playerTotals[row.player_display_name] += row.fantasy_points_ppr
    }

    // Find top scorer
    let topScorer = ''
    let maxPoints = 0
    for (const [player, points] of Object.entries(playerTotals)) {
      if (points > maxPoints) {
        maxPoints = points
        topScorer = player
      }
    }

    // Count unique players
    const activePlayers = new Set(yearData.map(d => d.player_display_name)).size

    return {
      topScorer,
      maxPoints,
      activePlayers,
    }
  }, [yearData])

  return (
    <div>
      <h2 className={`
        text-2xl font-bold mb-2
        ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
      `}>
        Welcome to the Fantasy Command Center
      </h2>
      <p className={`
        text-sm mb-6
        ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
      `}>
        Showing latest data for the <strong>{latestYear} NFL Season</strong>.
      </p>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <Metric 
          label={`Top Player of ${latestYear}`}
          value={stats.topScorer}
        />
        <Metric 
          label="Highest Total Points"
          value={stats.maxPoints.toFixed(1)}
        />
        <Metric 
          label="Active Players"
          value={stats.activePlayers}
        />
      </div>

      <InfoBox type="info">
        <strong>Select a tool tab above</strong> (Fantasy Radar or Deep Dive Fantasy Tool) to start analyzing players, seasons, or trends.
      </InfoBox>
    </div>
  )
}
