import { PlayerData, PlayerWeekStats, PlayerProfile, PlayerProfilesData } from '@/types'

const SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]
const TARGET_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'FB', 'K', 'DEF']

// Cache for loaded data
let cachedData: PlayerData[] | null = null
let cachedProfiles: Record<string, PlayerProfile> | null = null

// Helper function to process raw stats data into PlayerData
function processStatsData(data: PlayerWeekStats[]): PlayerData[] {
  const processed: PlayerData[] = []
  
  for (const row of data) {
    // Filter: Regular season (week <= 18) and target positions
    if (row.week > 18) continue
    if (!TARGET_POSITIONS.includes(row.position)) continue
    
    // Standardize column names
    const recentTeam = row.recent_team || row.team
    
    // Calculate fantasy points PPR if not present
    let fantasyPointsPpr = row.fantasy_points_ppr || row.fantasy_points || 0
    
    // Kicker logic
    if (row.position === 'K') {
      const fgMade = row.fg_made || 0
      const patMade = row.pat_made || 0
      fantasyPointsPpr = (fgMade * 3) + (patMade * 1)
    }
    
    const playerData: PlayerData = {
      player_display_name: row.player_display_name,
      position: row.position,
      recent_team: recentTeam,
      season: row.season,
      week: row.week,
      opponent_team: row.opponent_team,
      fantasy_points_ppr: fantasyPointsPpr,
      passing_epa: row.passing_epa || 0,
      rushing_epa: row.rushing_epa || 0,
      receiving_epa: row.receiving_epa || 0,
      passing_yards: row.passing_yards || 0,
      passing_tds: row.passing_tds || 0,
      passing_interceptions: row.passing_interceptions || 0,
      rushing_yards: row.rushing_yards || 0,
      rushing_tds: row.rushing_tds || 0,
      receptions: row.receptions || 0,
      receiving_yards: row.receiving_yards || 0,
      receiving_tds: row.receiving_tds || 0,
      targets: row.targets || 0,
      fg_made: row.fg_made || 0,
      fg_att: row.fg_att || 0,
      fg_pct: row.fg_att > 0 ? (row.fg_made / row.fg_att) * 100 : 0,
      pat_made: row.pat_made || 0,
      pat_att: row.pat_att || 0,
      pat_pct: (row.pat_att || 0) > 0 ? ((row.pat_made || 0) / (row.pat_att || 0)) * 100 : 0,
      height: row.height,
      weight: row.weight,
      college_name: row.college_name,
      jersey_number: row.jersey_number,
      headshot_url: row.headshot_url,
    }
    
    processed.push(playerData)
  }
  
  return processed
}

export async function loadAllData(): Promise<PlayerData[]> {
  if (cachedData) {
    return cachedData
  }

  // Fetch all season files in parallel for faster loading
  const fetchPromises = SEASONS.map(async (year) => {
    try {
      const response = await fetch(`/json_data/stats_${year}.json`)
      if (!response.ok) return []
      
      const data: PlayerWeekStats[] = await response.json()
      return processStatsData(data)
    } catch (error) {
      console.error(`Error loading stats_${year}.json:`, error)
      return []
    }
  })

  // Wait for all fetches to complete simultaneously
  const allResults = await Promise.all(fetchPromises)
  
  // Flatten all results into a single array
  const allData = allResults.flat()

  // Remove duplicates (same player, season, week)
  const seen = new Set<string>()
  const deduplicated = allData.filter(row => {
    const key = `${row.player_display_name}-${row.season}-${row.week}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  cachedData = deduplicated
  return deduplicated
}

export async function loadPlayerProfiles(season: number = 2025): Promise<Record<string, PlayerProfile>> {
  if (cachedProfiles) {
    return cachedProfiles
  }

  try {
    const response = await fetch(`/json_data/player_profiles_${season}.json`)
    if (!response.ok) return {}
    
    const data: PlayerProfilesData = await response.json()
    cachedProfiles = data.profiles
    return data.profiles
  } catch (error) {
    console.error('Error loading player profiles:', error)
    return {}
  }
}

export function getPlayerProfile(profiles: Record<string, PlayerProfile>, playerName: string): PlayerProfile | null {
  return profiles[playerName] || null
}

export function getAvailableSeasons(data: PlayerData[]): number[] {
  const seasons = [...new Set(data.map(d => d.season))]
  return seasons.sort((a, b) => b - a) // Descending
}

export function getAvailablePositions(data: PlayerData[]): string[] {
  const positions = [...new Set(data.map(d => d.position))]
  return positions.sort()
}

export function filterBySeasonAndPositions(
  data: PlayerData[], 
  season: number, 
  positions?: string[]
): PlayerData[] {
  let filtered = data.filter(d => d.season === season)
  if (positions && positions.length > 0) {
    filtered = filtered.filter(d => positions.includes(d.position))
  }
  return filtered
}

// Helper functions
export function formatHeight(heightInches: number | undefined): string {
  if (!heightInches) return '-'
  const feet = Math.floor(heightInches / 12)
  const inches = heightInches % 12
  const cm = Math.round(heightInches * 2.54)
  return `${feet}'${inches}" (${cm}cm)`
}

export function formatWeight(weight: number | undefined): string {
  if (!weight) return '-'
  return `${weight} lbs`
}

export function getHeadshotPath(playerName: string, position: string): string {
  // Build filename: "First_Last_POS.png"
  // Remove periods (e.g., "A.J. Brown" -> "AJ Brown") and replace spaces with underscores
  const cleanName = playerName.replace(/\./g, '').replace(/ /g, '_')
  const filename = `${cleanName}_${position}.png`
  return `/headshots/${filename}`
}

export function safeGet<T, D = T>(value: T | undefined | null, defaultValue: D): T | D {
  if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
    return defaultValue
  }
  return value
}
