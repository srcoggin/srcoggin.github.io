// NFL Team Colors Utility
// Official primary colors for all 32 NFL teams

export const NFL_TEAM_COLORS: Record<string, string> = {
    // AFC East
    'BUF': '#00338D', // Buffalo Bills - Blue
    'MIA': '#008E97', // Miami Dolphins - Aqua
    'NE': '#002244',  // New England Patriots - Navy
    'NYJ': '#125740', // New York Jets - Green

    // AFC North
    'BAL': '#241773', // Baltimore Ravens - Purple
    'CIN': '#FB4F14', // Cincinnati Bengals - Orange
    'CLE': '#FF3C00', // Cleveland Browns - Orange
    'PIT': '#FFB612', // Pittsburgh Steelers - Gold

    // AFC South
    'HOU': '#03202F', // Houston Texans - Deep Steel Blue
    'IND': '#002C5F', // Indianapolis Colts - Blue
    'JAX': '#006778', // Jacksonville Jaguars - Teal
    'TEN': '#4B92DB', // Tennessee Titans - Light Blue

    // AFC West
    'DEN': '#FB4F14', // Denver Broncos - Orange
    'KC': '#E31837',  // Kansas City Chiefs - Red
    'LV': '#000000',  // Las Vegas Raiders - Black
    'LAC': '#0080C6', // Los Angeles Chargers - Powder Blue

    // NFC East
    'DAL': '#041E42', // Dallas Cowboys - Navy
    'NYG': '#0B2265', // New York Giants - Blue
    'PHI': '#004C54', // Philadelphia Eagles - Midnight Green
    'WAS': '#5A1414', // Washington Commanders - Burgundy

    // NFC North
    'CHI': '#0B162A', // Chicago Bears - Navy
    'DET': '#0076B6', // Detroit Lions - Honolulu Blue
    'GB': '#203731',  // Green Bay Packers - Green
    'MIN': '#4F2683', // Minnesota Vikings - Purple

    // NFC South
    'ATL': '#A71930', // Atlanta Falcons - Red
    'CAR': '#0085CA', // Carolina Panthers - Blue
    'NO': '#D3BC8D',  // New Orleans Saints - Gold
    'TB': '#D50A0A',  // Tampa Bay Buccaneers - Red

    // NFC West
    'ARI': '#97233F', // Arizona Cardinals - Cardinal Red
    'LA': '#003594',  // Los Angeles Rams - Royal Blue
    'SF': '#AA0000',  // San Francisco 49ers - Scarlet
    'SEA': '#002244', // Seattle Seahawks - Navy

    // Alternate abbreviations sometimes used
    'OAK': '#000000', // Oakland Raiders (legacy)
    'SD': '#0080C6',  // San Diego Chargers (legacy)
    'STL': '#003594', // St. Louis Rams (legacy)
    'WSH': '#5A1414', // Washington (alt abbreviation)
}

// Full team names to abbreviation mapping
export const TEAM_NAME_TO_ABBR: Record<string, string> = {
    'Bills': 'BUF',
    'Buffalo Bills': 'BUF',
    'Dolphins': 'MIA',
    'Miami Dolphins': 'MIA',
    'Patriots': 'NE',
    'New England Patriots': 'NE',
    'Jets': 'NYJ',
    'New York Jets': 'NYJ',
    'Ravens': 'BAL',
    'Baltimore Ravens': 'BAL',
    'Bengals': 'CIN',
    'Cincinnati Bengals': 'CIN',
    'Browns': 'CLE',
    'Cleveland Browns': 'CLE',
    'Steelers': 'PIT',
    'Pittsburgh Steelers': 'PIT',
    'Texans': 'HOU',
    'Houston Texans': 'HOU',
    'Colts': 'IND',
    'Indianapolis Colts': 'IND',
    'Jaguars': 'JAX',
    'Jacksonville Jaguars': 'JAX',
    'Titans': 'TEN',
    'Tennessee Titans': 'TEN',
    'Broncos': 'DEN',
    'Denver Broncos': 'DEN',
    'Chiefs': 'KC',
    'Kansas City Chiefs': 'KC',
    'Raiders': 'LV',
    'Las Vegas Raiders': 'LV',
    'Chargers': 'LAC',
    'Los Angeles Chargers': 'LAC',
    'Cowboys': 'DAL',
    'Dallas Cowboys': 'DAL',
    'Giants': 'NYG',
    'New York Giants': 'NYG',
    'Eagles': 'PHI',
    'Philadelphia Eagles': 'PHI',
    'Commanders': 'WAS',
    'Washington Commanders': 'WAS',
    'Bears': 'CHI',
    'Chicago Bears': 'CHI',
    'Lions': 'DET',
    'Detroit Lions': 'DET',
    'Packers': 'GB',
    'Green Bay Packers': 'GB',
    'Vikings': 'MIN',
    'Minnesota Vikings': 'MIN',
    'Falcons': 'ATL',
    'Atlanta Falcons': 'ATL',
    'Panthers': 'CAR',
    'Carolina Panthers': 'CAR',
    'Saints': 'NO',
    'New Orleans Saints': 'NO',
    'Buccaneers': 'TB',
    'Tampa Bay Buccaneers': 'TB',
    'Cardinals': 'ARI',
    'Arizona Cardinals': 'ARI',
    'Rams': 'LA',
    'Los Angeles Rams': 'LA',
    '49ers': 'SF',
    'San Francisco 49ers': 'SF',
    'Seahawks': 'SEA',
    'Seattle Seahawks': 'SEA',
}

/**
 * Get the primary color for an NFL team
 * @param teamAbbr - Team abbreviation (e.g., 'BAL', 'SEA') or full name
 * @returns Hex color code or undefined if not found
 */
export function getTeamColor(teamAbbr: string): string | undefined {
    if (!teamAbbr) return undefined

    // Try direct lookup
    const directColor = NFL_TEAM_COLORS[teamAbbr.toUpperCase()]
    if (directColor) return directColor

    // Try name-to-abbr lookup
    const abbr = TEAM_NAME_TO_ABBR[teamAbbr]
    if (abbr) return NFL_TEAM_COLORS[abbr]

    return undefined
}

/**
 * Get inline style object for team-colored text
 * @param teamAbbr - Team abbreviation or name
 * @returns Style object with color property, or empty object if not found
 */
export function getTeamColorStyle(teamAbbr: string): React.CSSProperties {
    const color = getTeamColor(teamAbbr)
    return color ? { color } : {}
}
