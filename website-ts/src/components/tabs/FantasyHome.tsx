'use client'

import { useMemo, useState, useEffect } from 'react'
import Metric from '@/components/Metric'
import Divider from '@/components/Divider'
import InfoBox from '@/components/InfoBox'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData } from '@/types'

interface FantasyHomeProps {
  data: PlayerData[]
}

interface DraftPick {
  pick: number
  round: number
  team: string
  player_name: string
  position: string
  college: string
  height: string
  weight: number
  stats: Record<string, number>
}

interface MockDraftData {
  picks: DraftPick[]
}

// Team name mappings
const TEAM_NAMES: Record<string, string> = {
  'LV': 'Las Vegas Raiders',
  'NYJ': 'New York Jets',
  'ARI': 'Arizona Cardinals',
  'TEN': 'Tennessee Titans',
  'NYG': 'New York Giants',
  'CLE': 'Cleveland Browns',
  'WSH': 'Washington Commanders',
  'NO': 'New Orleans Saints',
  'KC': 'Kansas City Chiefs',
  'CIN': 'Cincinnati Bengals',
  'MIA': 'Miami Dolphins',
  'DAL': 'Dallas Cowboys',
  'LAR': 'Los Angeles Rams',
  'BAL': 'Baltimore Ravens',
  'TB': 'Tampa Bay Buccaneers',
  'DET': 'Detroit Lions',
  'MIN': 'Minnesota Vikings',
  'CAR': 'Carolina Panthers',
  'PIT': 'Pittsburgh Steelers',
  'LAC': 'Los Angeles Chargers',
  'PHI': 'Philadelphia Eagles',
  'CHI': 'Chicago Bears',
  'BUF': 'Buffalo Bills',
  'SF': 'San Francisco 49ers',
  'HOU': 'Houston Texans',
  'DEN': 'Denver Broncos',
  'NE': 'New England Patriots',
  'SEA': 'Seattle Seahawks',
  'GB': 'Green Bay Packers',
  'IND': 'Indianapolis Colts',
  'ATL': 'Atlanta Falcons',
  'JAX': 'Jacksonville Jaguars',
}

// Top 5 fantasy-relevant prospect blurbs
const TOP_PROSPECT_BLURBS: Record<string, { description: string; highlights: string[] }> = {
  'Fernando Mendoza': {
    description: "The 2025 Heisman Trophy winner led Indiana to a perfect 16-0 season and national championship. At 6'5\" with elite processing, anticipation, and accuracy to all three levels, Mendoza projects as an immediate NFL starter. His 91.6 PFF grade and 41 TD / 6 INT ratio showcase his rare ability to diagnose coverages and deliver accurate throws under pressure.",
    highlights: ['Heisman Trophy Winner', 'National Champion', '72% Completion Rate', 'Pro Comparison: Jared Goff']
  },
  'Jeremiyah Love': {
    description: "The Doak Walker Award winner and 3rd-place Heisman finisher is the consensus RB1 of the 2026 class. A former state champion sprinter with elite speed, Love combines patience, vision, and receiving ability into a complete package. His 40 total touchdowns over his final 28 college games demonstrate rare scoring ability.",
    highlights: ['Doak Walker Winner', '6.9 YPC Average', '21 Total TDs', 'Pro Comparison: Travis Etienne']
  },
  'Carnell Tate': {
    description: "Ohio State continues its 'WR U' legacy with Tate, a 6'3\" contested-catch specialist with elite body control and ball-tracking ability. Following Marvin Harrison Jr. and Emeka Egbuka as first-round picks, Tate averaged 17.2 yards per catch and is projected as a top-10 selection.",
    highlights: ['17.2 YPC Average', 'Ohio State WR Legacy', 'Elite Contested Catches', 'Pro Comparison: George Pickens']
  },
  'Makai Lemon': {
    description: "The 2025 Biletnikoff Award winner as the nation's best receiver, Lemon led USC with 79 catches for 1,156 yards. His explosive cuts, advanced route-running, and strong contested catch ability (66.7% success rate) project him as a high-value slot receiver who can dominate in the right system.",
    highlights: ['Biletnikoff Winner', 'Top-10 in Rec, Yards, TDs', '66.7% Contested Catch Rate', 'Pro Comparison: Amon-Ra St. Brown']
  },
  'Ty Simpson': {
    description: "After waiting three years behind Bryce Young and Jalen Milroe, Simpson delivered a stellar starting debut: 3,567 yards, 28 TDs, and just 5 INTs while leading Alabama to the SEC title game. His elite processing and accuracy in the short-to-intermediate game make him a day-one starter prospect.",
    highlights: ['28 TD / 5 INT Ratio', 'SEC Championship Game', 'Elite Processing', '3,567 Passing Yards']
  },
}

// Featured prospect picks (fantasy-relevant positions in top picks)
const FEATURED_PROSPECT_PICKS = [1, 8, 4, 16, 21] // Mendoza, Love, Tate, Lemon, Simpson

export default function FantasyHome({ data }: FantasyHomeProps) {
  const { theme } = useTheme()
  const [mockDraft, setMockDraft] = useState<MockDraftData | null>(null)

  // Load mock draft data
  useEffect(() => {
    const loadMockDraft = async () => {
      try {
        const response = await fetch('/json_data/mock_draft.json')
        if (response.ok) {
          const data = await response.json()
          setMockDraft(data)
        }
      } catch (error) {
        console.error('Error loading mock draft:', error)
      }
    }
    loadMockDraft()
  }, [])

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

  // Get featured prospects and remaining first-rounders
  const { featuredProspects, remainingFirstRound } = useMemo(() => {
    if (!mockDraft) return { featuredProspects: [], remainingFirstRound: [] }
    
    const firstRound = mockDraft.picks.filter(p => p.round === 1)
    const featured = FEATURED_PROSPECT_PICKS
      .map(pick => firstRound.find(p => p.pick === pick))
      .filter((p): p is DraftPick => p !== undefined)
    
    const remaining = firstRound.filter(p => !FEATURED_PROSPECT_PICKS.includes(p.pick))
    
    return { featuredProspects: featured, remainingFirstRound: remaining }
  }, [mockDraft])

  // Format stats for display
  const formatProspectStats = (pick: DraftPick) => {
    const { stats, position } = pick
    if (position === 'QB') {
      return `${stats.pass_yds?.toLocaleString() || 0} YDS | ${stats.td || 0} TD | ${stats.int || 0} INT | ${stats.pct || 0}% CMP`
    } else if (position === 'RB') {
      return `${stats.rush_yds?.toLocaleString() || 0} YDS | ${stats.td || 0} TD | ${stats.avg || 0} YPC | ${stats.rec_yds || 0} REC YDS`
    } else if (position === 'WR') {
      return `${stats.rec || 0} REC | ${stats.rec_yds?.toLocaleString() || 0} YDS | ${stats.td || 0} TD | ${stats.avg || 0} AVG`
    } else if (position === 'TE') {
      return `${stats.rec || 0} REC | ${stats.rec_yds?.toLocaleString() || 0} YDS | ${stats.td || 0} TD`
    }
    return ''
  }

  const cardBg = theme === 'dark' ? 'bg-[#1a1d24]' : 'bg-[#f6f8fa]'
  const cardBorder = theme === 'dark' ? 'border-[#30363d]' : 'border-[#d0d7de]'
  const textPrimary = theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'
  const textSecondary = theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'

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
        <strong>Select a tool tab above</strong> check out the upcoming rookies, analyze players, look at old seasons, or pick up on valuable trends.
      </InfoBox>

      {/* 2026 NFL Draft Prospects Section */}
      {mockDraft && (
        <>
          <Divider />
          
          <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>
            2026 NFL Draft - Hottest Fantasy Prospects
          </h2>
          <p className={`text-sm mb-6 ${textSecondary}`}>
            The top fantasy-relevant prospects heading into the 2026 NFL Draft. Get ahead of your dynasty leagues!
          </p>

          {/* Featured Prospects */}
          <div className="space-y-4 mb-8">
            {featuredProspects.map((prospect) => {
              const blurb = TOP_PROSPECT_BLURBS[prospect.player_name]
              return (
                <div 
                  key={prospect.pick}
                  className={`p-5 rounded-xl border ${cardBg} ${cardBorder}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Pick badge and basic info */}
                    <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/30">
                        #{prospect.pick}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${textPrimary}`}>
                          {prospect.player_name}
                        </h3>
                        <p className={`text-sm ${textSecondary}`}>
                          {prospect.position} • {prospect.college}
                        </p>
                        <p className={`text-sm font-medium text-blue-500`}>
                          → {TEAM_NAMES[prospect.team] || prospect.team}
                        </p>
                      </div>
                    </div>

                    {/* Right: Description and stats */}
                    <div className="flex-1">
                      {blurb && (
                        <>
                          <p className={`text-sm mb-3 ${textSecondary}`}>
                            {blurb.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {blurb.highlights.map((highlight, i) => (
                              <span 
                                key={i}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  theme === 'dark' 
                                    ? 'bg-blue-900/50 text-blue-300' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      <div className={`text-sm font-mono ${textSecondary}`}>
                        <span className="font-semibold">2025 Stats:</span> {formatProspectStats(prospect)}
                      </div>
                      <div className={`text-xs mt-1 ${textSecondary}`}>
                        {prospect.height} | {prospect.weight} lbs
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Remaining First Round Picks */}
          <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>
            Rest of the Projected First Round
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {remainingFirstRound.map((prospect) => (
              <div 
                key={prospect.pick}
                className={`p-3 rounded-lg border ${cardBg} ${cardBorder} flex items-center gap-3`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  theme === 'dark' ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#e1e4e8] text-[#57606a]'
                }`}>
                  {prospect.pick}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${textPrimary}`}>
                    {prospect.player_name}
                  </div>
                  <div className={`text-xs ${textSecondary}`}>
                    {prospect.position} • {prospect.college}
                  </div>
                </div>
                <div className={`text-xs font-medium ${textSecondary}`}>
                  {prospect.team}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
