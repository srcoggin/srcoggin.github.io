import { PlayerData, PlayerMetrics, BoomBustStats } from '@/types'

// Calculate player metrics for Deep Dive tool
export function getPlayerMetrics(
  data: PlayerData[], 
  playerName: string
): PlayerMetrics[] | null {
  const playerData = data
    .filter(d => d.player_display_name === playerName)
    .sort((a, b) => a.week - b.week)
  
  if (playerData.length === 0) return null

  // Calculate defensive rankings
  const passDefRanks = calculatePassDefenseRanks(data)
  const rushDefRanks = calculateRushDefenseRanks(data)

  return playerData.map(row => {
    const totalEpa = (row.passing_epa || 0) + (row.rushing_epa || 0) + (row.receiving_epa || 0)
    
    return {
      week: row.week,
      opponent: row.opponent_team,
      points: row.fantasy_points_ppr,
      epa: totalEpa,
      passDefRank: passDefRanks[row.opponent_team],
      rushDefRank: rushDefRanks[row.opponent_team],
      passYds: row.passing_yards,
      passTD: row.passing_tds,
      int: row.passing_interceptions,
      rushYds: row.rushing_yards,
      rushTD: row.rushing_tds,
      tgt: row.targets,
      rec: row.receptions,
      recYds: row.receiving_yards,
      recTD: row.receiving_tds,
      fgMade: row.fg_made,
      fgAtt: row.fg_att,
      fgPct: row.fg_pct,
      patMade: row.pat_made,
      patAtt: row.pat_att,
      patPct: row.pat_pct,
    }
  })
}

function calculatePassDefenseRanks(data: PlayerData[]): Record<string, number> {
  // Filter to pass catchers
  const passData = data.filter(d => ['QB', 'WR', 'TE'].includes(d.position))
  
  // Group by opponent team and sum fantasy points
  const teamTotals: Record<string, number> = {}
  for (const row of passData) {
    if (!teamTotals[row.opponent_team]) {
      teamTotals[row.opponent_team] = 0
    }
    teamTotals[row.opponent_team] += row.fantasy_points_ppr
  }

  // Rank teams (lower total = better defense = lower rank)
  const sorted = Object.entries(teamTotals).sort((a, b) => a[1] - b[1])
  const ranks: Record<string, number> = {}
  sorted.forEach(([team], index) => {
    ranks[team] = index + 1
  })

  return ranks
}

function calculateRushDefenseRanks(data: PlayerData[]): Record<string, number> {
  // Filter to RBs
  const rushData = data.filter(d => d.position === 'RB')
  
  // Group by opponent team and sum fantasy points
  const teamTotals: Record<string, number> = {}
  for (const row of rushData) {
    if (!teamTotals[row.opponent_team]) {
      teamTotals[row.opponent_team] = 0
    }
    teamTotals[row.opponent_team] += row.fantasy_points_ppr
  }

  // Rank teams (lower total = better defense = lower rank)
  const sorted = Object.entries(teamTotals).sort((a, b) => a[1] - b[1])
  const ranks: Record<string, number> = {}
  sorted.forEach(([team], index) => {
    ranks[team] = index + 1
  })

  return ranks
}

// Calculate Boom/Bust statistics
export function calculateBoomBust(data: PlayerData[]): BoomBustStats[] {
  // Group by player
  const playerGroups: Record<string, PlayerData[]> = {}
  for (const row of data) {
    if (!playerGroups[row.player_display_name]) {
      playerGroups[row.player_display_name] = []
    }
    playerGroups[row.player_display_name].push(row)
  }

  const stats: BoomBustStats[] = []

  for (const [playerName, rows] of Object.entries(playerGroups)) {
    const totalGames = rows.length
    const points = rows.map(r => r.fantasy_points_ppr)
    const avgPoints = points.reduce((a, b) => a + b, 0) / totalGames
    const maxPoints = Math.max(...points)
    
    // Count booms (>= 25 pts) and busts (< 8 pts)
    const boomWeeks = rows.filter(r => r.fantasy_points_ppr >= 25).length
    const bustWeeks = rows.filter(r => r.fantasy_points_ppr < 8).length
    
    // Calculate real EPA average
    const totalEpas = rows.map(r => 
      (r.passing_epa || 0) + (r.rushing_epa || 0) + (r.receiving_epa || 0)
    )
    const realAvgEpa = totalEpas.reduce((a, b) => a + b, 0) / totalGames

    stats.push({
      player_display_name: playerName,
      position: rows[0].position,
      recent_team: rows[0].recent_team,
      totalGames,
      avgPoints,
      maxPoints,
      boomWeeks,
      bustWeeks,
      realAvgEpa,
    })
  }

  // Dynamic filter: if max games < 5, use 1 game min; otherwise use 5
  const maxGamesInSet = Math.max(...stats.map(s => s.totalGames))
  const threshold = maxGamesInSet >= 5 ? 5 : 1

  return stats.filter(s => s.totalGames >= threshold)
}

// Calculate aggregated stats for a list of players
export function calculatePlayerAggregates(data: PlayerData[]): {
  avgPpg: Record<string, number>
  avgEpa: Record<string, number>
  gamesPlayed: Record<string, number>
} {
  const playerGroups: Record<string, PlayerData[]> = {}
  for (const row of data) {
    if (!playerGroups[row.player_display_name]) {
      playerGroups[row.player_display_name] = []
    }
    playerGroups[row.player_display_name].push(row)
  }

  const avgPpg: Record<string, number> = {}
  const avgEpa: Record<string, number> = {}
  const gamesPlayed: Record<string, number> = {}

  for (const [playerName, rows] of Object.entries(playerGroups)) {
    const points = rows.map(r => r.fantasy_points_ppr)
    avgPpg[playerName] = points.reduce((a, b) => a + b, 0) / rows.length

    const epas = rows.map(r => 
      (r.passing_epa || 0) + (r.rushing_epa || 0) + (r.receiving_epa || 0)
    )
    avgEpa[playerName] = epas.reduce((a, b) => a + b, 0) / rows.length

    gamesPlayed[playerName] = rows.length
  }

  return { avgPpg, avgEpa, gamesPlayed }
}

// Get unique players with their stats
export interface UniquePlayer {
  name: string
  position: string
  team: string
  avgPpg: number
  avgEpa: number
  gamesPlayed: number
  searchLabel: string
}

export function getUniquePlayers(data: PlayerData[]): UniquePlayer[] {
  const { avgPpg, avgEpa, gamesPlayed } = calculatePlayerAggregates(data)
  
  const seen = new Set<string>()
  const players: UniquePlayer[] = []

  for (const row of data) {
    if (seen.has(row.player_display_name)) continue
    seen.add(row.player_display_name)

    players.push({
      name: row.player_display_name,
      position: row.position,
      team: row.recent_team,
      avgPpg: avgPpg[row.player_display_name] || 0,
      avgEpa: avgEpa[row.player_display_name] || 0,
      gamesPlayed: gamesPlayed[row.player_display_name] || 0,
      searchLabel: `${row.player_display_name} (${row.position}) - ${(avgPpg[row.player_display_name] || 0).toFixed(1)} PPG`,
    })
  }

  return players
}
