'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import YearSelector from '@/components/YearSelector'
import Divider from '@/components/Divider'
import Expander from '@/components/Expander'
import InfoBox from '@/components/InfoBox'
import Metric from '@/components/Metric'
import DataTable from '@/components/DataTable'
import PlayerChart from '@/components/PlayerChart'
import Autocomplete from '@/components/Autocomplete'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData, PlayerMetrics, PlayerProfile } from '@/types'
import { getPlayerMetrics, getUniquePlayers, UniquePlayer } from '@/utils/calculations'
import { 
  getAvailableSeasons, 
  getAvailablePositions, 
  filterBySeasonAndPositions,
  loadPlayerProfiles,
  getPlayerProfile,
  formatHeight,
  formatWeight,
  getHeadshotPath,
  safeGet
} from '@/utils/dataLoader'

interface DeepDiveProps {
  data: PlayerData[]
}

export default function DeepDive({ data }: DeepDiveProps) {
  const { theme } = useTheme()
  const availableYears = useMemo(() => getAvailableSeasons(data), [data])
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || 2025)
  
  // Filter data by year
  const yearData = useMemo(() => {
    return data.filter(d => d.season === selectedYear)
  }, [data, selectedYear])
  
  const availablePositions = useMemo(() => getAvailablePositions(yearData), [yearData])
  
  // Position filter state
  const [selectedPositions, setSelectedPositions] = useState<string[]>(availablePositions)
  const [selectAll, setSelectAll] = useState(true)
  
  // Sort method
  const [sortMethod, setSortMethod] = useState('Alphabetical (A-Z)')
  
  // Selected player
  const [selectedPlayerLabel, setSelectedPlayerLabel] = useState<string | null>(null)
  
  // Player profiles
  const [profiles, setProfiles] = useState<Record<string, PlayerProfile>>({})
  
  // Load profiles on mount
  useEffect(() => {
    loadPlayerProfiles(2025).then(setProfiles)
  }, [])
  
  // Update selected positions when year changes
  useEffect(() => {
    setSelectedPositions(availablePositions)
    setSelectAll(true)
  }, [availablePositions])
  
  // Filter data by positions
  const filteredData = useMemo(() => {
    return yearData.filter(d => selectedPositions.includes(d.position))
  }, [yearData, selectedPositions])
  
  // Get unique players with stats
  const uniquePlayers = useMemo(() => {
    let players = getUniquePlayers(filteredData)
    
    // Apply sorting and filters
    if (sortMethod === 'Highest PPG') {
      // Filter out kickers with < 11 games
      players = players.filter(p => p.position !== 'K' || p.gamesPlayed >= 11)
      players.sort((a, b) => b.avgPpg - a.avgPpg)
    } else if (sortMethod === 'Highest EPA') {
      players = players.filter(p => p.gamesPlayed >= 11)
      players.sort((a, b) => b.avgEpa - a.avgEpa)
    } else if (sortMethod === 'Lowest EPA') {
      players = players.filter(p => p.gamesPlayed >= 11)
      players.sort((a, b) => a.avgEpa - b.avgEpa)
    } else {
      players.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return players
  }, [filteredData, sortMethod])
  
  // Set default selection when players list changes
  useEffect(() => {
    if (uniquePlayers.length > 0 && !selectedPlayerLabel) {
      setSelectedPlayerLabel(uniquePlayers[0].searchLabel)
    }
  }, [uniquePlayers, selectedPlayerLabel])
  
  // Get selected player data
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerLabel) return null
    return uniquePlayers.find(p => p.searchLabel === selectedPlayerLabel) || null
  }, [uniquePlayers, selectedPlayerLabel])
  
  // Get player metrics
  const playerMetrics = useMemo(() => {
    if (!selectedPlayer) return null
    return getPlayerMetrics(filteredData, selectedPlayer.name)
  }, [filteredData, selectedPlayer])
  
  // Get player bio data
  const playerBioRow = useMemo(() => {
    if (!selectedPlayer) return null
    return yearData.find(d => d.player_display_name === selectedPlayer.name) || null
  }, [yearData, selectedPlayer])
  
  // Get player profile (only for 2025)
  const playerProfile = useMemo(() => {
    if (!selectedPlayer || selectedYear !== 2025) return null
    return getPlayerProfile(profiles, selectedPlayer.name)
  }, [selectedPlayer, selectedYear, profiles])
  
  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedPositions([])
      setSelectAll(false)
    } else {
      setSelectedPositions(availablePositions)
      setSelectAll(true)
    }
  }
  
  // Handle position toggle
  const handlePositionToggle = (pos: string) => {
    if (selectedPositions.includes(pos)) {
      setSelectedPositions(selectedPositions.filter(p => p !== pos))
    } else {
      setSelectedPositions([...selectedPositions, pos])
    }
  }
  
  // Calculate average stats for selected player
  const avgStats = useMemo(() => {
    if (!playerMetrics) return { avgPts: 0, avgEpa: 0 }
    const avgPts = playerMetrics.reduce((a, b) => a + b.points, 0) / playerMetrics.length
    const avgEpa = playerMetrics.reduce((a, b) => a + b.epa, 0) / playerMetrics.length
    return { avgPts, avgEpa }
  }, [playerMetrics])
  
  // Determine which columns to show based on player position and activity
  const { hasPassingActivity, hasRushingActivity, hasReceivingActivity, specColumns } = useMemo(() => {
    if (!playerMetrics || !selectedPlayer) {
      return { hasPassingActivity: false, hasRushingActivity: false, hasReceivingActivity: false, specColumns: [] }
    }
    
    const hasPassing = playerMetrics.some(m => Math.abs(m.passYds) > 0 || Math.abs(m.passTD) > 0)
    const hasRushing = playerMetrics.some(m => Math.abs(m.rushYds) > 0 || Math.abs(m.rushTD) > 0)
    const hasReceiving = playerMetrics.some(m => Math.abs(m.recYds) > 0 || Math.abs(m.rec) > 0)
    
    const pos = selectedPlayer.position
    let cols: string[] = []
    
    if (pos === 'QB') {
      cols = ['passYds', 'passTD', 'int', 'rushYds', 'rushTD']
      if (hasReceiving) cols.push('tgt', 'rec', 'recYds', 'recTD')
    } else if (pos === 'RB' || pos === 'FB') {
      cols = ['rushYds', 'rushTD', 'tgt', 'rec', 'recYds', 'recTD']
      if (hasPassing) cols.push('passYds', 'passTD', 'int')
    } else if (pos === 'WR' || pos === 'TE') {
      cols = ['tgt', 'rec', 'recYds', 'recTD']
      if (hasRushing) cols.push('rushYds', 'rushTD')
      if (hasPassing) cols.push('passYds', 'passTD', 'int')
    } else if (pos === 'K') {
      cols = ['fgMade', 'fgAtt', 'fgPct', 'patMade', 'patAtt', 'patPct']
    }
    
    return { 
      hasPassingActivity: hasPassing, 
      hasRushingActivity: hasRushing, 
      hasReceivingActivity: hasReceiving,
      specColumns: cols 
    }
  }, [playerMetrics, selectedPlayer])
  
  // Matchup efficiency columns
  const matchupColumns = useMemo(() => {
    if (selectedPlayer?.position === 'K') return []
    
    return [
      { key: 'week', header: 'Week' },
      { key: 'opponent', header: 'Opponent' },
      { key: 'points', header: 'Points', format: (v: number) => v.toFixed(1) },
      { key: 'epa', header: 'EPA', format: (v: number) => v.toFixed(2) },
      { 
        key: 'passDefRank', 
        header: 'Pass Def Rank',
        format: (v: number) => v ? v.toFixed(0) : '-',
        cellClass: (v: number) => {
          if (!v) return ''
          if (v <= 8) return 'bg-red-200 text-black'
          if (v >= 25) return 'bg-green-200 text-black'
          return ''
        }
      },
      { 
        key: 'rushDefRank', 
        header: 'Rush Def Rank',
        format: (v: number) => v ? v.toFixed(0) : '-',
        cellClass: (v: number) => {
          if (!v) return ''
          if (v <= 8) return 'bg-red-200 text-black'
          if (v >= 25) return 'bg-green-200 text-black'
          return ''
        }
      },
    ]
  }, [selectedPlayer])
  
  // Box score columns
  const boxScoreColumns = useMemo(() => {
    const colDefs: Record<string, { key: string; header: string; format?: (v: number) => string; cellClass?: (v: number, row: PlayerMetrics) => string }> = {
      week: { key: 'week', header: 'Week' },
      opponent: { key: 'opponent', header: 'Opponent' },
      passYds: { key: 'passYds', header: 'Pass Yds', format: (v: number) => v.toFixed(0) },
      passTD: { key: 'passTD', header: 'Pass TD', format: (v: number) => v.toFixed(0) },
      int: { key: 'int', header: 'Int', format: (v: number) => v.toFixed(0) },
      rushYds: { key: 'rushYds', header: 'Rush Yds', format: (v: number) => v.toFixed(0) },
      rushTD: { key: 'rushTD', header: 'Rush TD', format: (v: number) => v.toFixed(0) },
      tgt: { key: 'tgt', header: 'Tgt', format: (v: number) => v.toFixed(0) },
      rec: { key: 'rec', header: 'Rec', format: (v: number) => v.toFixed(0) },
      recYds: { key: 'recYds', header: 'Rec Yds', format: (v: number) => v.toFixed(0) },
      recTD: { key: 'recTD', header: 'Rec TD', format: (v: number) => v.toFixed(0) },
      fgMade: { key: 'fgMade', header: 'FG M', format: (v: number) => v.toFixed(0) },
      fgAtt: { key: 'fgAtt', header: 'FG A', format: (v: number) => v.toFixed(0) },
      fgPct: { key: 'fgPct', header: 'FG%', format: (v: number) => v.toFixed(1) + '%' },
      patMade: { key: 'patMade', header: 'PAT M', format: (v: number) => v.toFixed(0) },
      patAtt: { key: 'patAtt', header: 'PAT A', format: (v: number) => v.toFixed(0) },
      patPct: { key: 'patPct', header: 'PAT%', format: (v: number) => v.toFixed(1) + '%' },
    }
    
    const cols = [colDefs.week, colDefs.opponent]
    for (const key of specColumns) {
      if (colDefs[key]) {
        // Add cell highlighting logic
        const col = { ...colDefs[key] }
        if (key === 'tgt' || key === 'rec') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const tgt = row.tgt || 0
            const rec = row.rec || 0
            if (tgt >= 5 && rec < tgt * 0.5) {
              return 'bg-red-200 text-black'
            }
            return ''
          }
        } else if (key === 'int') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const ints = row.int || 0
            const passTD = row.passTD || 0
            // Red: > 2 ints
            if (ints > 2) return 'bg-red-200 text-black'
            // Green: QB with 3+ Pass TDs and ≤1 INT
            if (selectedPlayer?.position === 'QB' && passTD >= 3 && ints <= 1) {
              return 'bg-green-200 text-black'
            }
            return ''
          }
        } else if (key === 'passTD') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const passTD = row.passTD || 0
            const ints = row.int || 0
            // Green: QB with 3+ Pass TDs and ≤1 INT
            if (selectedPlayer?.position === 'QB' && passTD >= 3 && ints <= 1) {
              return 'bg-green-200 text-black'
            }
            return ''
          }
        } else if (key === 'recTD') {
          col.cellClass = (v: number) => {
            if (v >= 2) return 'bg-green-200 text-black'
            return ''
          }
        } else if (key === 'rushTD') {
          col.cellClass = (v: number) => {
            if (v >= 2) return 'bg-green-200 text-black'
            return ''
          }
        }
        cols.push(col)
      }
    }
    
    return cols
  }, [specColumns, selectedPlayer])

  // Theme colors
  const textPrimary = theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'
  const textSecondary = theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'
  const selectStyles = theme === 'dark' 
    ? 'bg-[#21262d] border-[#30363d] text-[#f0f6fc]' 
    : 'bg-[#f6f8fa] border-[#d0d7de] text-[#1f2328]'

  return (
    <div>
      <YearSelector 
        years={availableYears}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />
      
      <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>🔎 Deep Dive Tool</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          {/* Metric Key */}
          <Expander title="📖 Metric Key" defaultExpanded={false}>
            <div className="space-y-2">
              <InfoBox type="info">📊 <strong>EPA</strong>: Efficiency (&gt;0 good)</InfoBox>
              <InfoBox type="info">🛡️ <strong>Def</strong>: Red=Tough, Green=Easy</InfoBox>
              <InfoBox type="info">💣 <strong>Boom/Bust</strong>: High Ceiling/Floor</InfoBox>
            </div>
          </Expander>
          
          <Divider />
          
          {/* Filter Positions */}
          <div>
            <p className={`font-medium mb-1 ${textPrimary}`}>Filter Positions</p>
            <p className={`text-sm mb-3 ${textSecondary}`}>Check the boxes to view positions</p>
            
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllToggle}
                className="w-4 h-4 accent-blue-500"
              />
              <span className={textPrimary}>Select All</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {availablePositions.map(pos => (
                <label key={pos} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPositions.includes(pos)}
                    onChange={() => handlePositionToggle(pos)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className={textPrimary}>{pos}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Sort By */}
          <div>
            <p className={`font-medium mb-1 ${textPrimary}`}>Sort By</p>
            <p className={`text-sm mb-2 ${textSecondary}`}>Sort by various ranges of metrics</p>
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 ${selectStyles}`}
            >
              <option>Alphabetical (A-Z)</option>
              <option>Highest PPG</option>
              <option>Highest EPA</option>
              <option>Lowest EPA</option>
            </select>
          </div>
          
          <Divider />
          
          {/* Player Search */}
          <div>
            <h3 className={`text-lg font-bold mb-3 ${textPrimary}`}>Player Search</h3>
            {uniquePlayers.length === 0 ? (
              <p className="text-yellow-500">No players found.</p>
            ) : (
              <Autocomplete
                options={uniquePlayers.map(p => ({
                  value: p.searchLabel,
                  label: p.searchLabel,
                }))}
                value={selectedPlayerLabel}
                onChange={setSelectedPlayerLabel}
                placeholder="Type to search players..."
              />
            )}
          </div>
          
          {/* Quick Metrics */}
          {selectedPlayer && playerMetrics && (
            <div className="space-y-4 mt-4">
              <Metric 
                label={`Avg Points (${selectedYear})`}
                value={avgStats.avgPts.toFixed(1)}
              />
              {!['K', 'DEF'].includes(selectedPlayer.position) && (
                <Metric 
                  label={`Avg EPA (${selectedYear})`}
                  value={avgStats.avgEpa.toFixed(2)}
                />
              )}
              
              {/* Player Profile Blurb (only for 2025) */}
              {playerProfile && playerProfile.blurb && (
                <>
                  <Divider />
                  <h4 className={`font-bold ${textPrimary}`}>📝 Season Summary</h4>
                  <InfoBox type="info">
                    {playerProfile.blurb}
                  </InfoBox>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Right Column - Content */}
        <div>
          {selectedPlayer && playerMetrics && playerBioRow ? (
            <>
              {/* Bio Header */}
              <div className="flex items-end gap-6 mb-6">
                <div className={`
                  w-[280px] h-[200px] relative overflow-hidden rounded-xl shadow-lg
                  ${theme === 'dark' ? 'bg-[#21262d]' : 'bg-[#f6f8fa]'}
                `}>
                  <Image
                    src={getHeadshotPath(selectedPlayer.name, selectedPlayer.position)}
                    alt={selectedPlayer.name}
                    width={280}
                    height={200}
                    className="object-cover w-full h-full"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/headshots/default.png'
                    }}
                  />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
                    {selectedPlayer.name} ({selectedPlayer.position})
                  </h2>
                  <p className={textSecondary}>
                    <strong>{safeGet(playerBioRow.recent_team, '-')}</strong>
                    {' | #'}
                    {safeGet(playerBioRow.jersey_number, '-')}
                    {' | '}
                    {formatHeight(playerBioRow.height)}
                    {' | '}
                    {formatWeight(playerBioRow.weight)}
                    {' | '}
                    {safeGet(playerBioRow.college_name, '-')}
                  </p>
                </div>
              </div>
              
              <Divider />
              
              {/* Chart */}
              <PlayerChart data={playerMetrics} />
              
              {/* Matchup Efficiency Table */}
              {selectedPlayer.position !== 'K' && (
                <>
                  <p className={`text-sm mt-6 mb-2 ${textSecondary}`}>Matchup Efficiency</p>
                  <DataTable 
                    data={playerMetrics}
                    columns={matchupColumns}
                  />
                </>
              )}
              
              {/* Box Score Table */}
              <p className={`text-sm mt-6 mb-2 ${textSecondary}`}>Weekly Box Score</p>
              
              {/* Box Score Legend */}
              <Expander title="📖 Box Score Legend" defaultExpanded={false} className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-[#3fb950]' : 'text-[#1a7f37]'}`}>
                      🟢 Green Highlights
                    </p>
                    <p className={`text-xs ${textSecondary}`}>• QB: 3+ Pass TDs with ≤1 INT</p>
                    <p className={`text-xs ${textSecondary}`}>• WR/RB/TE: 2+ Rushing or Receiving TDs</p>
                  </div>
                  <div>
                    <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-[#f85149]' : 'text-[#cf222e]'}`}>
                      🔴 Red Highlights
                    </p>
                    <p className={`text-xs ${textSecondary}`}>• Catch rate &lt; 50% (on 5+ targets)</p>
                    <p className={`text-xs ${textSecondary}`}>• More than 2 interceptions</p>
                  </div>
                </div>
              </Expander>
              
              <DataTable 
                data={playerMetrics}
                columns={boxScoreColumns}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className={textSecondary}>Select a player to view detailed statistics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
