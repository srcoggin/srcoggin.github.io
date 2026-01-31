'use client'

import { useState, useMemo } from 'react'
import YearSelector from '@/components/YearSelector'
import Divider from '@/components/Divider'
import DataTable from '@/components/DataTable'
import InfoBox from '@/components/InfoBox'
import { IconStar, IconWarning, IconTrendUp } from '@/components/Icons'
import { PlayerData, BoomBustStats } from '@/types'
import { calculateBoomBust } from '@/utils/calculations'
import { getAvailableSeasons } from '@/utils/dataLoader'

interface FantasyRadarProps {
  data: PlayerData[]
}

// 2025 NFL Draft Rookies - Fantasy relevant players
const ROOKIES_2025 = new Set([
  // QBs
  'Cam Ward', 'Jaxson Dart', 'Shedeur Sanders', 'Quinn Ewers', 'Carson Beck',
  // RBs
  'Ashton Jeanty', 'Omarion Hampton', 'Kaleb Johnson', 'TreVeyon Henderson', 
  'Cam Skattebo', 'Quinshon Judkins', 'Bhayshul Tuten', 'Kyle Monangai',
  // WRs
  'Tetairoa McMillan', 'Luther Burden III', 'Emeka Egbuka', 'Jayden Higgins',
  'Matthew Golden', 'Tory Horton', 'Devaughn Vele', 'Pat Bryant', 'Kyle Williams',
  'Tre Harris', 'Travis Hunter', 'J. Michael Sturdivant',
  // TEs
  'Colston Loveland', 'Tyler Warren', 'Harold Fannin Jr.', 'Terrance Ferguson',
])

// 2026 Expected Breakout Candidates (Non-Rookies)
const BREAKOUT_CANDIDATES = [
  {
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    team: 'Arizona Cardinals',
    analysis: 'Enters 2026 with depressed ADP after a disappointing Year 1. New coaching staff and another year of chemistry with Kyler Murray could unlock elite WR1 upside at a discount price.',
    upside: 'Top-5 WR potential at WR15+ cost',
    source: 'FantasyPros',
  },
  {
    name: 'Breece Hall',
    position: 'RB',
    team: 'Free Agent',
    analysis: 'Underperformed on a dysfunctional Jets team but has RB1 talent. If he lands with an offensive-minded team in free agency, expect a massive bounce-back season.',
    upside: 'Elite RB1 in right landing spot',
    source: 'FantasyPros',
  },
  {
    name: 'Ashton Jeanty',
    position: 'RB',
    team: 'Las Vegas Raiders',
    analysis: 'Rushed for nearly 1,000 yards despite league-worst run blocking (3.7 YPC, 80% yards after contact). If Raiders improve their O-line, his efficiency should skyrocket.',
    upside: 'Top-8 RB with improved blocking',
    source: 'PFF/FantasyPros',
  },
  {
    name: 'Jaxson Dart',
    position: 'QB',
    team: 'New York Giants',
    analysis: 'Posted 15 passing TDs and 9 rushing TDs as a rookie with an injured supporting cast. Malik Nabers returning healthy + new coaching staff = QB1 upside.',
    upside: 'Top-10 QB with healthy weapons',
    source: 'SI Fantasy',
  },
  {
    name: 'Tyler Shough',
    position: 'QB',
    team: 'New Orleans Saints',
    analysis: 'Averaged 20 fantasy points per game over the final five weeks. With a full offseason as the starter and improved weapons, could emerge as a solid QB1.',
    upside: 'QB10-15 range',
    source: 'FantasyPros',
  },
  {
    name: 'Luther Burden III',
    position: 'WR',
    team: 'Chicago Bears',
    analysis: 'Emerged late in Year 1 with two 100+ yard games. Elite efficiency: top-10 in target separation (2.63), YPRR (2.79), and yards per target (10.9). Primed for WR2 leap.',
    upside: 'Top-20 WR breakout',
    source: 'FantasyPros',
  },
  {
    name: 'Jayden Higgins',
    position: 'WR',
    team: 'Houston Texans',
    analysis: 'At 6\'4", proved to be a red zone weapon with 6 TDs as a rookie. With C.J. Stroud improving and more targets available, Year 2 could be huge.',
    upside: 'WR3 with WR2 upside',
    source: 'PFF/FantasyPros',
  },
  {
    name: 'Brock Bowers',
    position: 'TE',
    team: 'Las Vegas Raiders',
    analysis: 'Already elite as a rookie but handcuffed by poor QB play. If Raiders upgrade at QB, Bowers could challenge for TE1 overall with 100+ targets.',
    upside: 'TE1 overall',
    source: 'FantasyPros',
  },
  {
    name: 'Bhayshul Tuten',
    position: 'RB',
    team: 'Jacksonville Jaguars',
    analysis: 'With Travis Etienne Jr. expected to depart in free agency, Tuten slides into the RB1 role. Averaged 4.6 YPC and forced 19 missed tackles on just 87 carries.',
    upside: 'RB2 with weekly upside',
    source: 'PFF',
  },
  {
    name: 'Dallas Turner',
    position: 'EDGE',
    team: 'Minnesota Vikings',
    analysis: 'While not fantasy-relevant in most formats, leagues should note his 24 pressures and 7 sacks in the second half. If Minnesota upgrades the Secondary or even the other half of the D-Line, the Vikings D/ST could look to rival the 2021 Cowboys D/ST',
    upside: 'Defensive Supercharger',
    source: 'PFF',
  },
]

// 2026 Regression/Decline Candidates
const REGRESSION_CANDIDATES = [
  {
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'San Francisco 49ers',
    analysis: 'Finished as RB1 in 2025 but major red flags: career-high 311 carries, lowest YPC (3.9) since rookie year, and turns 30 in training camp. The age cliff is real for RBs.',
    concern: 'Age 30 + career-high workload',
    source: 'SI Fantasy',
  },
  {
    name: 'Derrick Henry',
    position: 'RB',
    team: 'Baltimore Ravens',
    analysis: 'At 32 years old with 2,000+ career carries, Father Time is undefeated. His efficiency has declined, and the Ravens may look to reduce his workload to preserve him.',
    concern: 'Age 32, heavy career mileage',
    source: 'SI Fantasy',
  },
  {
    name: 'Saquon Barkley',
    position: 'RB',
    team: 'Philadelphia Eagles',
    analysis: 'Coming off a dominant season, but RBs rarely sustain elite production past age 28. Heavy workload in 2025 could accelerate decline.',
    concern: 'Post-peak age, workload concerns',
    source: 'SI Fantasy',
  },
  {
    name: 'Davante Adams',
    position: 'WR',
    team: 'Free Agent',
    analysis: 'Caught 14 TDs on just 60 receptions for 789 yards - an unsustainable 23% TD rate. At 33 years old, 2025 was likely his "last hurrah" at elite production.',
    concern: 'Age 33, unsustainable TD rate',
    source: 'SI Fantasy',
  },
  {
    name: 'Travis Kelce',
    position: 'TE',
    team: 'Kansas City Chiefs',
    analysis: 'The greatest TE ever is 36 years old. His targets and efficiency have declined each of the past two years. Still useful, but TE1 days are likely over.',
    concern: 'Age 36, declining targets',
    source: 'SI Fantasy',
  },
  {
    name: 'Matthew Stafford',
    position: 'QB',
    team: 'Los Angeles Rams',
    analysis: 'Had an MVP-caliber season at 37, but history says QBs with chronic back injuries don\'t repeat elite seasons at 38. Expect regression to QB10-15 range.',
    concern: 'Age 38, injury history',
    source: 'SI Fantasy',
  },
  {
    name: 'Zay Flowers',
    position: 'WR',
    team: 'Baltimore Ravens',
    analysis: 'Finished as WR7 but was boosted by a massive Week 18 performance. Remove that outlier and he was WR18. Baltimore\'s run-heavy approach caps his ceiling.',
    concern: 'Inflated finish, run-heavy offense',
    source: 'SI Fantasy',
  },
  {
    name: 'Rico Dowdle',
    position: 'RB',
    team: 'Dallas Cowboys',
    analysis: 'Benefited from Chuba Hubbard\'s injury to post inflated numbers. As a pending free agent, unlikely to maintain bell-cow status. Classic one-year wonder risk.',
    concern: 'Injury-replacement production',
    source: 'SI Fantasy',
  },
  {
    name: 'Keenan Allen',
    position: 'WR',
    team: 'Chicago Bears',
    analysis: 'At 34 years old, his targets continue to decline with younger options emerging. Still a reliable floor play, but WR2 days are behind him.',
    concern: 'Age 34, declining role',
    source: 'SI Fantasy',
  },
  {
    name: 'Josh Jacobs',
    position: 'RB',
    team: 'Green Bay Packers',
    analysis: 'Turned 27 during the season and has over 1,500 career carries. The Packers may look to preserve him with a committee approach, limiting his ceiling.',
    concern: 'Age + heavy workload history',
    source: 'Various',
  },
]

export default function FantasyRadar({ data }: FantasyRadarProps) {
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

  // Helper to format name with rookie indicator
  const formatNameWithRookie = (name: string) => {
    if (ROOKIES_2025.has(name)) {
      return `${name} (R)`
    }
    return name
  }

  const boomColumns = [
    { 
      key: 'player_display_name', 
      header: 'Name',
      format: (v: string) => formatNameWithRookie(v),
    },
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
    { 
      key: 'player_display_name', 
      header: 'Name',
      format: (v: string) => formatNameWithRookie(v),
    },
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

  const getPositionBadgeClass = (position: string) => {
    const p = (position ?? '').trim().toUpperCase()
    switch (p) {
      case 'QB': return 'bg-red-500/20 text-red-400'
      case 'RB': return 'bg-green-500/20 text-green-400'
      case 'WR': return 'bg-blue-500/20 text-blue-400'
      case 'TE': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

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
    <div className="min-w-0 w-full">
      <YearSelector 
        years={availableYears}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
        className="mb-6"
      />

      <h2 className={`
        text-xl sm:text-2xl font-bold mb-2 break-words
        text-[var(--text-primary)]
      `}>
        🔥 The Boom/Bust Watch ({selectedYear})
      </h2>
      <p className={`
        text-xs sm:text-sm mb-4 break-words
        text-[var(--text-secondary)]
      `}>
        Identify League Winners (&gt;25 pts) and Lineup Killers (&lt;8 pts) from {selectedYear}.
      </p>

      <Divider />

      {/* Position Filter */}
      <div className="mb-6">
        <p className={`
          font-medium mb-2
          text-[var(--text-primary)]
        `}>
          Filter Positions:
        </p>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-primary)]/50"
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
            text-xl font-bold mb-4 flex items-center gap-2
            text-[var(--accent-green)]
          `}>
            <IconStar size={22} className="flex-shrink-0" />
            Boom Squad (&gt;25 pts)
          </h3>
          {boomData.length > 0 ? (
            <DataTable 
              data={boomData}
              columns={boomColumns}
              showGradient="green"
              gradientColumn="boomWeeks"
            />
          ) : (
            <p className={`text-sm text-[var(--text-secondary)]`}>
              No boom data available.
            </p>
          )}
        </div>

        {/* Bust Watch */}
        <div>
          <h3 className={`
            text-xl font-bold mb-4 flex items-center gap-2
            text-[var(--accent-red)]
          `}>
            <IconWarning size={22} className="flex-shrink-0" /> Bust Watch (&lt;8 pts)
          </h3>
          {bustData.length > 0 ? (
            <DataTable 
              data={bustData}
              columns={bustColumns}
              showGradient="red"
              gradientColumn="bustWeeks"
            />
          ) : (
            <p className={`text-sm text-[var(--text-secondary)]`}>
              No bust data available.
            </p>
          )}
        </div>
      </div>

      <p className={`text-xs mt-4 text-[var(--text-secondary)]`}>
        <strong>(R)</strong> = Rookie (2025 Draft Class)
      </p>

      <Divider />

      {/* 2026 Outlook Section */}
      <h2 className={`
        text-2xl font-bold mb-2
        text-[var(--text-primary)]
      `}>
        🔮 2026 Season Outlook - Breakouts & Busts
      </h2>
      <p className={`
        text-sm mb-4
        text-[var(--text-secondary)]
      `}>
        Non-rookie players expected to surge or decline in the upcoming season.
      </p>

      <InfoBox type="info" className="mb-6">
        <strong>Sources:</strong> Projections compiled from PFF (Dalton Wasserman, Jan 27, 2026), 
        FantasyPros (Jan 2026), and SI Fantasy. Individual sources noted per player.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breakout Candidates */}
        <div>
          <h3 className={`
            text-xl font-bold mb-4
            text-[var(--accent-green)]
          `}>
            📈 2026 Breakout Candidates
          </h3>
          <p className={`text-sm mb-4 text-[var(--text-secondary)]`}>
            Players poised for a big jump in fantasy value next season.
          </p>
          <div className="space-y-3">
            {BREAKOUT_CANDIDATES.map((player) => (
              <div 
                key={player.name}
                className="p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[var(--text-primary)]`}>
                        {player.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadgeClass(player.position)}`}>
                        {player.position}
                      </span>
                    </div>
                    <p className={`text-xs text-[var(--text-secondary)]`}>
                      {player.team}
                    </p>
                  </div>
                </div>
                <p className={`text-sm mt-2 text-[var(--text-primary)]`}>
                  {player.analysis}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                    <IconTrendUp size={14} /> {player.upside}
                  </span>
                  <span className={`text-xs text-[var(--text-secondary)]`}>
                    Source: {player.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regression Candidates */}
        <div>
          <h3 className={`
            text-xl font-bold mb-4 flex items-center gap-2
            text-[var(--accent-red)]
          `}>
            <IconWarning size={22} className="flex-shrink-0" /> 2026 Regression Watch
          </h3>
          <p className={`text-sm mb-4 text-[var(--text-secondary)]`}>
            Players who may decline or underperform their ADP next season.
          </p>
          <div className="space-y-3">
            {REGRESSION_CANDIDATES.map((player) => (
              <div 
                key={player.name}
                className="p-3 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[var(--text-primary)]`}>
                        {player.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadgeClass(player.position)}`}>
                        {player.position}
                      </span>
                    </div>
                    <p className={`text-xs text-[var(--text-secondary)]`}>
                      {player.team}
                    </p>
                  </div>
                </div>
                <p className={`text-sm mt-2 text-[var(--text-primary)]`}>
                  {player.analysis}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                    <IconWarning size={14} /> {player.concern}
                  </span>
                  <span className={`text-xs text-[var(--text-secondary)]`}>
                    Source: {player.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* Quick Reference */}
      <InfoBox type="warning" className="mt-6">
        <strong>Key Takeaways for 2026:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li><strong>Buy:</strong> Marvin Harrison Jr., Breece Hall, Ashton Jeanty, Luther Burden III at depressed ADPs</li>
          <li><strong>Sell:</strong> Christian McCaffrey, Derrick Henry, Travis Kelce before their value declines</li>
          <li><strong>Monitor:</strong> Landing spots for free agents (Hall, Adams) will drastically affect value</li>
        </ul>
      </InfoBox>
    </div>
  )
}
