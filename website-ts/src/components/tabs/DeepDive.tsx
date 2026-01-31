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
import { IconDeepDive, IconDoc, IconBook } from '@/components/Icons'
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
  const availableYears = useMemo(() => getAvailableSeasons(data), [data])
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || 2025)
  
  // Filter data by year
  const yearData = useMemo(() => {
    return data.filter(d => d.season === selectedYear)
  }, [data, selectedYear])
  
  const availablePositions = useMemo(() => getAvailablePositions(yearData), [yearData])
  // Filter position options: exclude FB from the Deep Dive filter
  const filterPositionOptions = useMemo(
    () => availablePositions.filter(p => p !== 'FB'),
    [availablePositions]
  )
  
  // Position filter state
  const [selectedPositions, setSelectedPositions] = useState<string[]>(filterPositionOptions)
  const [selectAll, setSelectAll] = useState(true)
  
  // Sort method
  const [sortMethod, setSortMethod] = useState('Alphabetical (A-Z)')
  
  // Selected player - track both label (for Autocomplete) and name (for persistence across seasons)
  const [selectedPlayerLabel, setSelectedPlayerLabel] = useState<string | null>(null)
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null)
  
  // Player profiles
  const [profiles, setProfiles] = useState<Record<string, PlayerProfile>>({})
  
  // Load profiles on mount
  useEffect(() => {
    loadPlayerProfiles(2025).then(setProfiles)
  }, [])
  
  // Update selected positions when year changes
  useEffect(() => {
    setSelectedPositions(filterPositionOptions)
    setSelectAll(true)
  }, [filterPositionOptions])
  
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
  
  // Set default selection when players list changes (only if no player selected yet)
  useEffect(() => {
    if (uniquePlayers.length > 0 && !selectedPlayerName) {
      setSelectedPlayerLabel(uniquePlayers[0].searchLabel)
      setSelectedPlayerName(uniquePlayers[0].name)
    }
  }, [uniquePlayers, selectedPlayerName])
  
  // When season changes, try to find the same player in the new season's data
  useEffect(() => {
    if (selectedPlayerName && uniquePlayers.length > 0) {
      const playerInNewSeason = uniquePlayers.find(p => p.name === selectedPlayerName)
      if (playerInNewSeason) {
        // Player exists in new season - update the label to match new stats
        setSelectedPlayerLabel(playerInNewSeason.searchLabel)
      }
    }
  }, [selectedYear, uniquePlayers, selectedPlayerName])
  
  // Get selected player data
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerLabel) return null
    return uniquePlayers.find(p => p.searchLabel === selectedPlayerLabel) || null
  }, [uniquePlayers, selectedPlayerLabel])
  
  // Get player metrics from full season data so defence ranks and weekly rows are stable (not affected by position filter)
  const playerMetrics = useMemo(() => {
    if (!selectedPlayer) return null
    return getPlayerMetrics(yearData, selectedPlayer.name)
  }, [yearData, selectedPlayer])
  
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

  // First season per player (for rookie detection)
  const playerFirstSeason = useMemo(() => {
    const map: Record<string, number> = {}
    for (const row of data) {
      const name = row.player_display_name
      if (map[name] === undefined) map[name] = row.season
      else map[name] = Math.min(map[name], row.season)
    }
    return map
  }, [data])

  const isRookie = selectedPlayer && selectedYear === playerFirstSeason[selectedPlayer.name]
  
  // Handle select all toggle: unchecked = only uncheck the "Select all" box; checked = fill in any unchecked position boxes
  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectAll(false)
    } else {
      setSelectedPositions(filterPositionOptions)
      setSelectAll(true)
    }
  }

  // Select All shows checked only when selectAll is true and every position is selected
  const selectAllChecked = selectAll && selectedPositions.length === filterPositionOptions.length && filterPositionOptions.every(p => selectedPositions.includes(p))
  
  // Handle position toggle; sync selectAll when user checks all positions manually
  const handlePositionToggle = (pos: string) => {
    if (selectedPositions.includes(pos)) {
      setSelectedPositions(selectedPositions.filter(p => p !== pos))
      setSelectAll(false)
    } else {
      const next = [...selectedPositions, pos]
      setSelectedPositions(next)
      if (next.length === filterPositionOptions.length) setSelectAll(true)
    }
  }
  
  // Handle player selection from Autocomplete
  const handlePlayerSelect = (label: string) => {
    setSelectedPlayerLabel(label)
    // Extract player name from the label and store it
    const player = uniquePlayers.find(p => p.searchLabel === label)
    if (player) {
      setSelectedPlayerName(player.name)
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
  
  // Matchup efficiency: green = top 10 defence (rank 1–10), red = bottom 10 (rank 23–32); number colour only
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
          if (v >= 1 && v <= 10) return 'text-[var(--accent-green)] font-medium'
          if (v >= 23 && v <= 32) return 'text-[var(--accent-red)] font-medium'
          return ''
        }
      },
      { 
        key: 'rushDefRank', 
        header: 'Rush Def Rank',
        format: (v: number) => v ? v.toFixed(0) : '-',
        cellClass: (v: number) => {
          if (!v) return ''
          if (v >= 1 && v <= 10) return 'text-[var(--accent-green)] font-medium'
          if (v >= 23 && v <= 32) return 'text-[var(--accent-red)] font-medium'
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
        // Legend: Green = QB 3+ Pass TDs ≤1 INT; WR/RB/TE 2+ Rush/Rec TDs. Red = catch rate <50% on 5+ tgt; >2 INT. Number colour only.
        const col = { ...colDefs[key] }
        if (key === 'tgt' || key === 'rec') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const tgt = row.tgt || 0
            const rec = row.rec || 0
            if (tgt >= 5 && rec < tgt * 0.5) return 'text-[var(--accent-red)] font-medium'
            return ''
          }
        } else if (key === 'int') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const ints = row.int || 0
            const passTD = row.passTD || 0
            if (ints > 2) return 'text-[var(--accent-red)] font-medium'
            if (selectedPlayer?.position === 'QB' && passTD >= 3 && ints <= 1) return 'text-[var(--accent-green)] font-medium'
            return ''
          }
        } else if (key === 'passTD') {
          col.cellClass = (v: number, row: PlayerMetrics) => {
            const passTD = row.passTD || 0
            const ints = row.int || 0
            if (selectedPlayer?.position === 'QB' && passTD >= 3 && ints <= 1) return 'text-[var(--accent-green)] font-medium'
            return ''
          }
        } else if (key === 'recTD') {
          col.cellClass = (v: number) => {
            if (v >= 2) return 'text-[var(--accent-green)] font-medium'
            return ''
          }
        } else if (key === 'rushTD') {
          col.cellClass = (v: number) => {
            if (v >= 2) return 'text-[var(--accent-green)] font-medium'
            return ''
          }
        }
        cols.push(col)
      }
    }
    
    return cols
  }, [specColumns, selectedPlayer])

  const textPrimary = 'text-[var(--text-primary)]'
  const textSecondary = 'text-[var(--text-secondary)]'
  const selectStyles = 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)]'

  return (
    <div className="min-w-0 w-full">
      <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words flex items-center gap-2 ${textPrimary}`}><IconDeepDive size={28} className="flex-shrink-0 text-[var(--accent-primary)]" /> Deep Dive Tool</h2>

      <YearSelector 
        years={availableYears}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-4 sm:gap-6 lg:gap-8">
        
        {/* Left Column - Controls */}
        <div className="space-y-4">
        
        
          
          {/* Filter Positions */}
          <div>
            <p className={`font-medium mb-1 ${textPrimary}`}>Filter Positions</p>
            <p className={`text-sm mb-3 ${textSecondary}`}>Check the boxes to view positions</p>
            
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAllChecked}
                onChange={handleSelectAllToggle}
                className="w-4 h-4"
              />
              <span className={textPrimary}>Select All</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {filterPositionOptions.map(pos => (
                <label key={pos} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPositions.includes(pos)}
                    onChange={() => handlePositionToggle(pos)}
                    className="w-4 h-4"
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
              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-primary)]/50 ${selectStyles}`}
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
                options={uniquePlayers.map(p => {
                  const rookieInYear = selectedYear === playerFirstSeason[p.name]
                  const label = rookieInYear ? `${p.searchLabel} • Rookie` : p.searchLabel
                  return { value: p.searchLabel, label }
                })}
                value={selectedPlayerLabel}
                onChange={handlePlayerSelect}
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
                  secondaryText="<-1 = Sold, 0-5 = Avg, 5-10 = Above Avg, >10 = Elite"
                />
              )}
              
              {/* Player Profile Blurb (only for 2025) */}
              {playerProfile && playerProfile.blurb && (
                <>
                  <Divider />
                  <h4 className={`font-bold flex items-center gap-2 ${textPrimary}`}><IconDoc size={18} className="flex-shrink-0" /> Season Summary</h4>
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
                <div className="w-[280px] h-[200px] relative overflow-hidden rounded-xl shadow-lg bg-[var(--bg-card)]"
              >
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
                  <h2 className={`text-2xl font-bold mb-2 flex flex-wrap items-center gap-2 ${textPrimary}`}>
                    {selectedPlayer.name} ({selectedPlayer.position})
                    {isRookie && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600 dark:bg-amber-500/30 dark:text-amber-400 border border-amber-500/40">
                        Rookie
                      </span>
                    )}
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
                  <Expander title={<><IconBook size={16} className="inline flex-shrink-0 mr-1" /> Metric Key (Defence ranks)</>} defaultExpanded={false} className="mb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium mb-1 text-[var(--accent-green)]">
                          🟢 Green Highlights
                        </p>
                        <p className={`text-xs ${textSecondary}`}>• Top 10 defence (rank 1–10)</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1 text-[var(--accent-red)]">
                          🔴 Red Highlights
                        </p>
                        <p className={`text-xs ${textSecondary}`}>• Bottom 10 defence (rank 23–32)</p>
                      </div>
                    </div>
                  </Expander>
                  <DataTable 
                    data={playerMetrics}
                    columns={matchupColumns}
                  />
                </>
              )}
              
              {/* Box Score Table */}
              <p className={`text-sm mt-6 mb-2 ${textSecondary}`}>Weekly Box Score</p>
              
              {/* Box Score Legend */}
              <Expander title={<><IconBook size={16} className="inline flex-shrink-0 mr-1" /> Box Score Legend</>} defaultExpanded={false} className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-1 text-[var(--accent-green)]">
                      🟢 Green Highlights
                    </p>
                    <p className={`text-xs ${textSecondary}`}>• QB: 3+ Pass TDs with ≤1 INT</p>
                    <p className={`text-xs ${textSecondary}`}>• WR/RB/TE: 2+ Rushing or Receiving TDs</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-[var(--accent-red)]">
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
