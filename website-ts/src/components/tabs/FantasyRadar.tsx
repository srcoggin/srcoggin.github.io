'use client'

import { useState, useMemo } from 'react'
import YearSelector from '@/components/YearSelector'
import Divider from '@/components/Divider'
import DataTable from '@/components/DataTable'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData, BoomBustStats } from '@/types'
import { calculateBoomBust } from '@/utils/calculations'
import { getAvailableSeasons } from '@/utils/dataLoader'

interface FantasyRadarProps {
  data: PlayerData[]
}

export default function FantasyRadar({ data }: FantasyRadarProps) {
  const { theme } = useTheme()
  const availableYears = useMemo(() => getAvailableSeasons(data), [data])
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || 2025)
  const [selectedPosition, setSelectedPosition] = useState('ALL POSITIONS')

  const filterOptions = ['ALL POSITIONS', 'QB', 'WR', 'RB', 'TE', 'FB']

  // Filter data by year and position
  const filteredData = useMemo(() => {
    let filtered = data.filter(d => d.season === selectedYear)
    
    if (selectedPosition === 'ALL POSITIONS') {
      const targetPositions = ['QB', 'WR', 'RB', 'TE', 'FB']
      filtered = filtered.filter(d => targetPositions.includes(d.position))
    } else {
      filtered = filtered.filter(d => d.position === selectedPosition)
    }
    
    return filtered
  }, [data, selectedYear, selectedPosition])

  // Calculate boom/bust stats
  const allStats = useMemo(() => {
    if (filteredData.length === 0) return []
    return calculateBoomBust(filteredData)
  }, [filteredData])

  // Boom squad - sorted by boom weeks descending
  const boomData = useMemo(() => {
    return [...allStats]
      .sort((a, b) => b.boomWeeks - a.boomWeeks)
      .slice(0, 15)
  }, [allStats])

  // Bust watch - players with avg > 10 pts, sorted by bust weeks descending
  const bustData = useMemo(() => {
    return [...allStats]
      .filter(s => s.avgPoints > 10)
      .sort((a, b) => b.bustWeeks - a.bustWeeks)
      .slice(0, 15)
  }, [allStats])

  const boomColumns = [
    { key: 'player_display_name', header: 'Name' },
    { key: 'position', header: 'Position' },
    { 
      key: 'boomWeeks', 
      header: 'Boom Weeks',
      format: (v: number) => v.toFixed(0),
    },
    { 
      key: 'maxPoints', 
      header: 'High Score',
      format: (v: number) => v.toFixed(1),
    },
    { 
      key: 'realAvgEpa', 
      header: 'EPA',
      format: (v: number) => v.toFixed(2),
    },
  ]

  const bustColumns = [
    { key: 'player_display_name', header: 'Name' },
    { key: 'position', header: 'Position' },
    { 
      key: 'bustWeeks', 
      header: 'Bust Weeks',
      format: (v: number) => v.toFixed(0),
    },
    { 
      key: 'avgPoints', 
      header: 'Avg Score',
      format: (v: number) => v.toFixed(1),
    },
    { 
      key: 'realAvgEpa', 
      header: 'EPA',
      format: (v: number) => v.toFixed(2),
    },
  ]

  if (filteredData.length === 0) {
    return (
      <div>
        <YearSelector 
          years={availableYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
          className="mb-6"
        />
        <div className="text-center py-8 text-yellow-500">
          No data found for {selectedPosition} in {selectedYear}.
        </div>
      </div>
    )
  }

  return (
    <div>
      <YearSelector 
        years={availableYears}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />

      <h2 className={`
        text-2xl font-bold mb-2
        ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
      `}>
        🔥 The Boom/Bust Radar ({selectedYear})
      </h2>
      <p className={`
        text-sm mb-4
        ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
      `}>
        Identify League Winners (&gt;25 pts) and Lineup Killers (&lt;8 pts).
      </p>

      <Divider />

      {/* Position Filter */}
      <div className="mb-6">
        <p className={`
          font-medium mb-2
          ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
        `}>
          Filter Positions:
        </p>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className={`
            px-3 py-2 rounded-lg border outline-none transition-all duration-200
            focus:ring-2 focus:ring-blue-500/50
            ${theme === 'dark' 
              ? 'bg-[#21262d] border-[#30363d] text-[#f0f6fc]' 
              : 'bg-[#f6f8fa] border-[#d0d7de] text-[#1f2328]'
            }
          `}
        >
          {filterOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Boom Squad */}
        <div>
          <h3 className={`
            text-xl font-bold mb-4
            ${theme === 'dark' ? 'text-[#3fb950]' : 'text-[#1a7f37]'}
          `}>
            🚀 Boom Squad (&gt;25 pts)
          </h3>
          {boomData.length > 0 ? (
            <DataTable 
              data={boomData}
              columns={boomColumns}
              showGradient="green"
              gradientColumn="boomWeeks"
            />
          ) : (
            <p className={`text-sm ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}`}>
              No boom data available.
            </p>
          )}
        </div>

        {/* Bust Watch */}
        <div>
          <h3 className={`
            text-xl font-bold mb-4
            ${theme === 'dark' ? 'text-[#f85149]' : 'text-[#cf222e]'}
          `}>
            📉 Bust Watch (&lt;8 pts)
          </h3>
          {bustData.length > 0 ? (
            <DataTable 
              data={bustData}
              columns={bustColumns}
              showGradient="red"
              gradientColumn="bustWeeks"
            />
          ) : (
            <p className={`text-sm ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}`}>
              No bust data available.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
