// Player stats from JSON
export interface PlayerWeekStats {
  player_id: string
  player_name: string
  player_display_name: string
  position: string
  position_group: string
  headshot_url: string
  season: number
  week: number
  season_type: string
  team: string
  recent_team?: string
  opponent_team: string
  
  // Passing stats
  completions?: number
  attempts?: number
  passing_yards: number
  passing_tds: number
  passing_interceptions: number
  passing_epa: number
  
  // Rushing stats
  carries?: number
  rushing_yards: number
  rushing_tds: number
  rushing_epa: number
  
  // Receiving stats
  receptions: number
  targets: number
  receiving_yards: number
  receiving_tds: number
  receiving_epa: number | null
  
  // Kicker stats
  fg_made: number
  fg_att: number
  fg_pct?: number | null
  pat_made?: number
  pat_att?: number
  pat_pct?: number | null
  
  // Fantasy points
  fantasy_points?: number
  fantasy_points_ppr?: number
  
  // Bio data
  height?: number
  weight?: number
  college_name?: string
  jersey_number?: number
}

// Processed player data for display
export interface PlayerData {
  player_display_name: string
  position: string
  recent_team: string
  season: number
  week: number
  opponent_team: string
  fantasy_points_ppr: number
  passing_epa: number
  rushing_epa: number
  receiving_epa: number
  passing_yards: number
  passing_tds: number
  passing_interceptions: number
  rushing_yards: number
  rushing_tds: number
  receptions: number
  receiving_yards: number
  receiving_tds: number
  targets: number
  fg_made: number
  fg_att: number
  fg_pct: number
  pat_made: number
  pat_att: number
  pat_pct: number
  height?: number
  weight?: number
  college_name?: string
  jersey_number?: number
  headshot_url?: string
}

// Player metrics for display
export interface PlayerMetrics {
  week: number
  opponent: string
  points: number
  epa: number
  passDefRank?: number
  rushDefRank?: number
  passYds: number
  passTD: number
  int: number
  rushYds: number
  rushTD: number
  tgt: number
  rec: number
  recYds: number
  recTD: number
  fgMade: number
  fgAtt: number
  fgPct: number
  patMade: number
  patAtt: number
  patPct: number
}

// Boom/Bust stats
export interface BoomBustStats {
  player_display_name: string
  position: string
  recent_team: string
  totalGames: number
  avgPoints: number
  maxPoints: number
  boomWeeks: number
  bustWeeks: number
  realAvgEpa: number
}

// Player profile from profiles JSON
export interface PlayerProfile {
  name: string
  position: string
  team: string
  season: number
  stats: {
    games: number
    total_pts: number
    avg_pts: number
    max_pts: number
    min_pts: number
    std_pts: number
    boom_games: number
    bust_games: number
    best_week: number
    best_opponent: string
    worst_week: number
    team: string
    total_rush_yards?: number
    total_rush_tds?: number
    total_rec_yards?: number
    receptions?: number
    targets?: number
  }
  blurb: string
  generated_at: string
  research_enhanced: boolean
}

export interface PlayerProfilesData {
  generated_at: string
  season: number
  total_players: number
  profiles: Record<string, PlayerProfile>
}
