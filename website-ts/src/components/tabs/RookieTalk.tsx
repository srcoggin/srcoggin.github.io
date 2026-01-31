'use client'

import { useState, useEffect } from 'react'
import Divider from '@/components/Divider'
import InfoBox from '@/components/InfoBox'
import { IconStar, IconWarning, IconTarget, IconList, IconSleep, IconTrendUp, IconTrendDown } from '@/components/Icons'

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
  source: string
  scraped_at: string
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

// Top 10 Fantasy Rookies with upside analysis
const TOP_FANTASY_ROOKIES = [
  {
    rank: 1,
    name: 'Jeremiyah Love',
    position: 'RB',
    college: 'Notre Dame',
    round: 1,
    upside: 'Elite RB1 potential in year one',
    analysis: 'The Doak Walker Award winner is the clear-cut RB1 of the 2026 class. At 6\'0", 214 lbs with elite speed (former state champion sprinter), Love combines patience, vision, and receiving ability into a complete package. His 40 total TDs over his final 28 college games demonstrate rare scoring ability. If he lands with the Saints or Chiefs, expect immediate RB1 production.',
    proComp: 'Travis Etienne',
    fantasyProjection: 'Top-7 RB',
    tier: 'Elite',
  },
  {
    rank: 2,
    name: 'Carnell Tate',
    position: 'WR',
    college: 'Ohio State',
    round: 1,
    upside: 'WR1 upside with elite contested-catch ability',
    analysis: 'Ohio State continues its "WR U" legacy with Tate, a 6\'3" contested-catch specialist with elite body control. Following Marvin Harrison Jr. and Emeka Egbuka as first-round picks, Tate averaged 17.2 YPC and projects as a true X receiver. Could follow the Ja\'Marr Chase/Malik Nabers path to immediate fantasy stardom.',
    proComp: 'George Pickens',
    fantasyProjection: 'Top-15 WR',
    tier: 'Elite',
  },
  {
    rank: 3,
    name: 'Jordyn Tyson',
    position: 'WR',
    college: 'Arizona State',
    round: 1,
    upside: 'Versatile WR2 with high floor',
    analysis: 'The top WR on PFF\'s big board, Tyson has experience at multiple receiver positions and projects as a Z receiver. His positional versatility and route-running ability give him an incredibly high floor. Landing spots like Miami or NO with a rookie QB could make him an instant fantasy starter.',
    proComp: 'Terry McLaurin',
    fantasyProjection: 'Top-20 WR',
    tier: 'Elite',
  },
  {
    rank: 4,
    name: 'Makai Lemon',
    position: 'WR',
    college: 'USC',
    round: 1,
    upside: 'Slot dominance in the right system',
    analysis: 'The 2025 Biletnikoff Award winner led USC with 79 catches for 1,156 yards. His explosive cuts, advanced route-running, and 66.7% contested catch rate project him as a high-value slot receiver. If he lands with a creative offensive mind (like Saints HC Kellen Moore), expect immediate PPR value.',
    proComp: 'Amon-Ra St. Brown',
    fantasyProjection: 'Top-24 WR',
    tier: 'High-End',
  },
  {
    rank: 5,
    name: 'Denzel Boston',
    position: 'WR',
    college: 'Washington',
    round: 1,
    upside: 'Size/speed combo with X-receiver traits',
    analysis: 'At 6\'4", 210 lbs, Boston improved each year at Washington and has the body of an X receiver with versatility to play elsewhere. His path to fantasy success is clearer than most late-first-round WRs. Landing with the Eagles or a similar pass-heavy offense could unlock WR2 upside.',
    proComp: 'Chris Olave',
    fantasyProjection: 'Top-30 WR',
    tier: 'High-End',
  },
  {
    rank: 6,
    name: 'KC Concepcion',
    position: 'WR',
    college: 'Texas A&M',
    round: 1,
    upside: 'Complete route-runner with big-play ability',
    analysis: 'Started as a slot receiver at NC State before becoming well-rounded at Texas A&M. Expected to go late first round, and landing spots like Buffalo (Josh Allen!) or San Francisco could be fantasy gold. His 15.1 YPC shows explosive upside.',
    proComp: 'Stefon Diggs',
    fantasyProjection: 'Top-30 WR',
    tier: 'High-End',
  },
  {
    rank: 7,
    name: 'Kenyon Sadiq',
    position: 'TE',
    college: 'Oregon',
    round: 1,
    upside: 'TE1 upside as athletic receiving threat',
    analysis: 'The only TE expected to go in round 1, Sadiq has elite speed for the position and projects as a receiving-focused TE similar to Dalton Kincaid. While he lacks Brock Bowers-level production, his athletic tools are rare. Could be a year-two breakout candidate.',
    proComp: 'Dalton Kincaid',
    fantasyProjection: 'Top-12 TE',
    tier: 'High-End',
  },
  {
    rank: 8,
    name: 'Jonah Coleman',
    position: 'RB',
    college: 'Washington',
    round: 3,
    upside: 'Goal-line back with pass-catching chops',
    analysis: 'At 5\'9", 220 lbs, Coleman has a unique build that could translate to goal-line success. He\'s the highest-graded RB in rushing AND receiving among Day 2 backs, plus has 249 pass-blocking snaps (more than other Day 2 RBs combined). A Doug Martin-style NFL role is possible.',
    proComp: 'Doug Martin',
    fantasyProjection: 'RB2/Flex',
    tier: 'Solid',
  },
  {
    rank: 9,
    name: 'Jadarian Price',
    position: 'RB',
    college: 'Notre Dame',
    round: 3,
    upside: 'Explosive athleticism with breakaway speed',
    analysis: 'Love\'s backfield mate has elite speed, acceleration, and change-of-direction ability. While his receiving production is limited (6 or fewer catches each year), his athletic testing should blow up the combine. High-risk, high-reward option in dynasty.',
    proComp: 'Raheem Mostert',
    fantasyProjection: 'RB3/Handcuff',
    tier: 'Solid',
  },
  {
    rank: 10,
    name: 'Chris Bell',
    position: 'WR',
    college: 'Louisville',
    round: 2,
    upside: 'YAC monster with explosive play ability',
    analysis: 'PFF\'s big board is notably higher on Bell than consensus rankings. He stood out this past season with his ability to make plays after the catch, finishing with a high YAC and explosive play rate. Note: ACL tear in November may impact rookie availability.',
    proComp: 'Jaylen Waddle',
    fantasyProjection: 'WR3 (Year 2)',
    tier: 'Solid',
  },
]

// Concerning prospects / potential busts
const CONCERNING_PROSPECTS = [
  {
    rank: 1,
    name: 'Carson Beck',
    position: 'QB',
    college: 'Miami',
    round: 3,
    concern: 'Inconsistency and turnover issues',
    analysis: 'Once projected as a top-5 pick, Beck\'s stock has plummeted due to 12 interceptions and questionable decision-making. His transfer to Miami after struggles at Georgia raises red flags. QBs drafted in round 3 rarely become fantasy-relevant, and Beck\'s issues under pressure are concerning.',
    redFlag: '12 INTs in 2025 season',
    tier: 'High Risk',
  },
  {
    rank: 2,
    name: 'Trinidad Chambliss',
    position: 'QB',
    college: 'Ole Miss',
    round: 3,
    concern: 'Limited passing experience and system-dependent',
    analysis: 'At just 6\'0", 200 lbs, Chambliss benefited from Ole Miss\'s scheme. His 22 TDs look nice, but his ceiling is limited and he\'ll need significant development. Round 3 QBs face an uphill battle to fantasy relevance.',
    redFlag: 'Undersized, scheme-dependent',
    tier: 'High Risk',
  },
  {
    rank: 3,
    name: 'Nicholas Singleton',
    position: 'RB',
    college: 'Penn State',
    round: 4,
    concern: 'Shared backfield, limited college production',
    analysis: 'Always shared the backfield with Kaytron Allen at Penn State. His 4.5 YPC is underwhelming compared to elite prospects. Being drafted in round 4 suggests a potential committee role in the NFL, limiting fantasy upside.',
    redFlag: 'Only 549 rushing yards in 2025',
    tier: 'Moderate Risk',
  },
  {
    rank: 4,
    name: 'Kaytron Allen',
    position: 'RB',
    college: 'Penn State',
    round: 4,
    concern: 'One-dimensional power back',
    analysis: 'While Allen had better raw stats than Singleton (1,303 yards), his limited receiving production (only 68 receiving yards) caps his PPR ceiling. Round 4 RBs rarely become fantasy starters without elite receiving ability.',
    redFlag: 'Only 68 receiving yards in 2025',
    tier: 'Moderate Risk',
  },
  {
    rank: 5,
    name: 'Demond Claiborne',
    position: 'RB',
    college: 'Wake Forest',
    round: 4,
    concern: 'Small-school production, undersized',
    analysis: 'At 5\'10", 195 lbs, Claiborne lacks the ideal NFL size. His 907 rushing yards against ACC competition doesn\'t project to NFL success. Late-round RBs need to be elite athletes or receivers to have fantasy value.',
    redFlag: 'Undersized at 195 lbs',
    tier: 'Moderate Risk',
  },
  {
    rank: 6,
    name: 'Zachariah Branch',
    position: 'WR',
    college: 'Georgia',
    round: 2,
    concern: 'Limited size and contested-catch ability',
    analysis: 'At 5\'10", 180 lbs, Branch is undersized for the NFL. His 10.0 YPC is concerning for a 2nd-round pick. Speed-only receivers who can\'t win contested catches often struggle to translate to fantasy value.',
    redFlag: 'Only 10.0 YPC average',
    tier: 'Moderate Risk',
  },
  {
    rank: 7,
    name: 'Germie Bernard',
    position: 'WR',
    college: 'Alabama',
    round: 2,
    concern: 'Crowded WR class, limited separation',
    analysis: 'In a deep WR class, Bernard\'s 13.5 YPC doesn\'t stand out. Second-round WRs have a surprisingly high bust rate - half of the 2024 2nd-round WRs were already traded. Bernard needs the perfect landing spot to have fantasy value.',
    redFlag: 'Modest 862 yards in Alabama\'s offense',
    tier: 'Moderate Risk',
  },
  {
    rank: 8,
    name: 'Garrett Nussmeier',
    position: 'QB',
    college: 'LSU',
    round: 4,
    concern: 'Injury concerns and limited exposure',
    analysis: 'Only 1,927 passing yards due to injury. Fourth-round QBs almost never become fantasy starters. His limited sample size makes him a poor dynasty investment despite the LSU pedigree.',
    redFlag: 'Only 1,927 passing yards',
    tier: 'High Risk',
  },
  {
    rank: 9,
    name: 'Deion Burks',
    position: 'WR',
    college: 'Oklahoma',
    round: 3,
    concern: 'Undersized slot with limited production',
    analysis: 'At 5\'9", 189 lbs with only 620 receiving yards, Burks faces an uphill battle. Third-round slot receivers need elite quickness to carve out a role, and his production doesn\'t scream "must-draft" in dynasty.',
    redFlag: 'Only 620 yards in final season',
    tier: 'Moderate Risk',
  },
  {
    rank: 10,
    name: 'Antonio Williams',
    position: 'WR',
    college: 'Clemson',
    round: 3,
    concern: 'Inconsistent production, limited big-play ability',
    analysis: 'At 5\'11", 190 lbs with only 604 yards and 4 TDs, Williams doesn\'t have the profile of a fantasy contributor. His 11.0 YPC suggests limited deep threat ability. A Day 3 WR with modest production is rarely worth a dynasty pick.',
    redFlag: 'Only 4 TDs in 2025',
    tier: 'Moderate Risk',
  },
]

// Dynasty rookie tiers by position
const DYNASTY_TIERS = {
  rb: [
    { tier: 'S', players: ['Jeremiyah Love'] },
    { tier: 'A', players: ['Jonah Coleman', 'Jadarian Price', 'Emmett Johnson'] },
    { tier: 'B', players: ['Nicholas Singleton', 'Kaytron Allen', 'Demond Claiborne'] },
  ],
  wr: [
    { tier: 'S', players: ['Carnell Tate', 'Jordyn Tyson'] },
    { tier: 'A', players: ['Makai Lemon', 'Denzel Boston', 'KC Concepcion', 'Chris Bell'] },
    { tier: 'B', players: ['Germie Bernard', 'Chris Brazzell II', 'Elijah Sarratt', 'Zachariah Branch'] },
  ],
  te: [
    { tier: 'S', players: ['Kenyon Sadiq'] },
    { tier: 'A', players: ['Eli Stowers', 'Max Klare'] },
    { tier: 'B', players: ['Michael Trigg', 'Jack Endries', 'Joe Royer'] },
  ],
  qb: [
    { tier: 'S', players: ['Fernando Mendoza'] },
    { tier: 'A', players: ['Ty Simpson'] },
    { tier: 'B', players: ['Trinidad Chambliss', 'Carson Beck', 'Garrett Nussmeier'] },
  ],
}

// Landing spot grades for fantasy
const LANDING_SPOT_GRADES = [
  { team: 'NO', grade: 'A+', reason: 'Kellen Moore offense, potential for immediate volume' },
  { team: 'KC', grade: 'A', reason: 'Proven RB success, elite offense' },
  { team: 'BUF', grade: 'A', reason: 'Josh Allen connection, high-scoring offense' },
  { team: 'SF', grade: 'A-', reason: 'Shanahan scheme, but crowded backfield risk' },
  { team: 'PHI', grade: 'B+', reason: 'Pass-heavy, but established pecking order' },
  { team: 'TEN', grade: 'B', reason: 'Rebuilding, but young QB developing' },
  { team: 'NYJ', grade: 'B-', reason: 'Unsettled QB situation' },
  { team: 'CLE', grade: 'C+', reason: 'Offensive line concerns, run-heavy approach' },
  { team: 'LV', grade: 'C', reason: 'Full rebuild mode, limited offensive weapons' },
]

export default function RookieTalk() {
  const [mockDraft, setMockDraft] = useState<MockDraftData | null>(null)
  const [activeSection, setActiveSection] = useState<'buy' | 'sell'>('buy')

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

  const cardBg = 'bg-[var(--bg-secondary)]'
  const cardBorder = 'border-[var(--border-color)]'
  const textPrimary = 'text-[var(--text-primary)]'
  const textSecondary = 'text-[var(--text-secondary)]'

  const getTierColor = (tier: string) => {
    const t = (tier ?? '').trim()
    const normalized = t.toLowerCase().replace(/\s+/g, '-')
    if (normalized === 'elite' || normalized === 's') return 'bg-emerald-500/20 text-emerald-400'
    if (normalized === 'high-end' || normalized === 'a') return 'bg-emerald-500/20 text-emerald-400'
    if (normalized === 'solid' || normalized === 'b') return 'bg-yellow-500/20 text-yellow-400'
    if (normalized === 'high-risk') return 'bg-red-500/20 text-red-400'
    if (normalized === 'moderate-risk') return 'bg-orange-500/20 text-orange-400'
    return 'bg-gray-500/20 text-gray-400'
  }

  const getPositionBadgeClass = (position: string) => {
    const p = (position ?? '').trim().toUpperCase()
    switch (p) {
      case 'QB': return 'bg-red-500/20 text-red-400'
      case 'RB': return 'bg-green-500/20 text-green-400'
      case 'WR': return 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
      case 'TE': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPositionColor = (position: string) => {
    const p = (position ?? '').trim().toUpperCase()
    switch (p) {
      case 'QB': return 'text-red-500'
      case 'RB': return 'text-green-500'
      case 'WR': return 'text-[var(--accent-primary)]'
      case 'TE': return 'text-orange-500'
      default: return textSecondary
    }
  }

  const firstRound = mockDraft?.picks.filter(p => p.round === 1) || []

  return (
    <div className="min-w-0 w-full">
      {/* Header */}
      <h2 className={`text-xl sm:text-2xl font-bold mb-2 break-words ${textPrimary}`}>
        2026 NFL Draft - Rookie Talk
      </h2>
      <p className={`text-xs sm:text-sm mb-4 break-words ${textSecondary}`}>
        Your guide to the 2026 rookie class for dynasty and redraft leagues.
      </p>

      {/* Source Attribution */}
      <InfoBox type="info" className="mb-6">
        <strong>Data Sources:</strong> Rankings and projections compiled from PFF Dynasty Rankings (Nathan Jahnke, Jan 26, 2026), 
        ESPN/Mel Kiper Big Board, and Tankathon Mock Draft. Mock draft order as projected by <strong>Tankathon.com</strong>.
      </InfoBox>

      <Divider />

      {/* Buy/Sell Toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveSection('buy')}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
            activeSection === 'buy'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          📈 Top 10 Rookies to BUY
        </button>
        <button
          onClick={() => setActiveSection('sell')}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
            activeSection === 'sell'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          📉 Top 10 Rookies to AVOID
        </button>
      </div>

      {/* Prospects Section */}
      {activeSection === 'buy' ? (
        <div className="space-y-4 mb-8">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <IconStar size={22} className="flex-shrink-0 text-green-500" />
            Top 10 Fantasy Rookies - Maximum Upside
          </h3>
          {TOP_FANTASY_ROOKIES.map((prospect) => (
            <div 
              key={prospect.rank}
              className={`p-5 rounded-xl border ${cardBg} ${cardBorder}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex items-center gap-4 lg:w-56 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow-lg shadow-green-600/30">
                    #{prospect.rank}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${textPrimary}`}>
                      {prospect.name}
                    </h4>
                    <p className="text-sm text-green-500">
                      {prospect.position} • {prospect.college}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getTierColor(prospect.tier)}`}>
                      {prospect.tier}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold text-green-500 mb-2 flex items-center gap-1`}>
                    <IconTrendUp size={16} /> {prospect.upside}
                  </p>
                  <p className={`text-sm mb-3 ${textSecondary}`}>
                    {prospect.analysis}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      Round {prospect.round}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                    }`}>
                      Comp: {prospect.proComp}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      Projection: {prospect.fantasyProjection}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <IconWarning size={22} className="flex-shrink-0 text-red-500" />
            Top 10 Concerning Prospects - Proceed with Caution
          </h3>
          {CONCERNING_PROSPECTS.map((prospect) => (
            <div 
              key={prospect.rank}
              className={`p-5 rounded-xl border ${cardBg} ${cardBorder}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex items-center gap-4 lg:w-56 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
                    #{prospect.rank}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${textPrimary}`}>
                      {prospect.name}
                    </h4>
                    <p className="text-sm text-red-500">
                      {prospect.position} • {prospect.college}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getTierColor(prospect.tier)}`}>
                      {prospect.tier}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold text-red-500 mb-2 flex items-center gap-1`}>
                    <IconTrendDown size={16} /> {prospect.concern}
                  </p>
                  <p className={`text-sm mb-3 ${textSecondary}`}>
                    {prospect.analysis}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      Round {prospect.round}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center gap-1 ${
                      'bg-red-500/20 text-red-400'
                    }`}>
                      <IconWarning size={12} /> {prospect.redFlag}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Divider />

      {/* Dynasty Tiers Section */}
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
        <IconTarget size={22} className="flex-shrink-0 text-[var(--accent-primary)]" />
        Dynasty Rookie Tiers by Position
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(DYNASTY_TIERS).map(([position, tiers]) => (
          <div key={position} className={`p-4 rounded-xl border ${cardBg} ${cardBorder}`}>
            <h4 className={`text-lg font-bold mb-3 ${getPositionColor(position.toUpperCase())}`}>
              {position.toUpperCase()}
            </h4>
            {tiers.map((tier) => (
              <div key={tier.tier} className="mb-3">
                <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded mb-1 ${getTierColor(tier.tier)}`}>
                  Tier {tier.tier}
                </span>
                <ul className={`text-sm ${textSecondary}`}>
                  {tier.players.map((player) => (
                    <li key={player} className="ml-2">• {player}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Divider />

      {/* Landing Spot Grades */}
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
        <IconTarget size={22} className="flex-shrink-0 text-[var(--accent-primary)]" />
        Best Landing Spots for Rookies
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {LANDING_SPOT_GRADES.map((spot) => (
          <div key={spot.team} className={`p-3 rounded-lg border ${cardBg} ${cardBorder} flex items-center gap-3`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
              spot.grade.startsWith('A') 
                ? 'bg-green-600 text-white' 
                : spot.grade.startsWith('B')
                  ? 'bg-yellow-600 text-white'
                  : 'bg-red-600 text-white'
            }`}>
              {spot.grade}
            </div>
            <div>
              <div className={`font-bold ${textPrimary}`}>
                {TEAM_NAMES[spot.team] || spot.team}
              </div>
              <div className={`text-xs ${textSecondary}`}>
                {spot.reason}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Full First Round Mock Draft */}
      <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${textPrimary}`}>
        <IconList size={22} className="flex-shrink-0" />
        Complete 2026 NFL First Round Mock Draft
      </h3>
      <p className={`text-sm mb-4 ${textSecondary}`}>
        Fantasy-relevant positions highlighted. As projected by <strong>Tankathon.com</strong>.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
        {firstRound.map((pick) => {
          const isFantasyRelevant = ['QB', 'RB', 'WR', 'TE'].includes(pick.position)
          return (
            <div 
              key={pick.pick}
              className={`p-2 rounded-lg border flex items-center gap-2 ${
                isFantasyRelevant
                  ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]/50'
                  : `${cardBg} ${cardBorder}`
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isFantasyRelevant
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }`}>
                {pick.pick}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${textPrimary}`}>
                  {pick.player_name}
                </div>
                <div className={`text-xs ${isFantasyRelevant ? getPositionColor(pick.position) : textSecondary}`}>
                  {pick.position} • {pick.team}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Divider />

      {/* Sleeper Alert Section */}
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textPrimary}`}>
        <IconSleep size={22} className="flex-shrink-0" />
        Sleeper Alert - Late-Round Values
      </h3>
      <div className={`p-5 rounded-xl border ${cardBg} ${cardBorder} mb-8`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className={`font-bold text-green-500 mb-2 flex items-center gap-1`}><IconStar size={16} /> Emmett Johnson (RB, Nebraska)</h4>
            <p className={`text-sm ${textSecondary}`}>
              Round 4 projection but has 1,451 rushing yards + 370 receiving yards. If he lands in Kansas City, could be a league-winner.
            </p>
          </div>
          <div>
            <h4 className={`font-bold text-[var(--accent-primary)] mb-2 flex items-center gap-1`}><IconStar size={16} /> Elijah Sarratt (WR, Indiana)</h4>
            <p className={`text-sm ${textSecondary}`}>
              Benefited from Mendoza&apos;s breakout with 65 catches and 15 TDs. Could be this year&apos;s Nico Collins-style value.
            </p>
          </div>
          <div>
            <h4 className={`font-bold text-orange-500 mb-2 flex items-center gap-1`}><IconStar size={16} /> Eli Stowers (TE, Vanderbilt)</h4>
            <p className={`text-sm ${textSecondary}`}>
              62 catches for 769 yards in a weak Vandy offense. Day 2-3 TEs with his production often outperform their draft capital.
            </p>
          </div>
        </div>
      </div>

      {/* Class Summary */}
      <InfoBox type="warning" className="mb-4">
        <strong>2026 Class Summary:</strong> This class is <strong>WR-heavy</strong> and <strong>RB-weak</strong>. 
        Jeremiyah Love is the only true RB1 prospect. If you need RB help, be prepared to pay a premium for Love 
        or target sleepers like Emmett Johnson. The WR depth means value can be found throughout rounds 1-3.
      </InfoBox>
    </div>
  )
}
