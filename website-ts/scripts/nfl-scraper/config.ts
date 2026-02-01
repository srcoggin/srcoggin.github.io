// NFL News Scraper - Configuration

import { RSSFeedConfig } from './types'

// RSS Feed Sources
export const RSS_FEEDS: RSSFeedConfig[] = [
    {
        name: 'ESPN NFL',
        url: 'https://www.espn.com/espn/rss/nfl/news',
    },
    {
        name: 'Yahoo Sports NFL',
        url: 'https://sports.yahoo.com/nfl/rss.xml',
    },
    {
        name: 'CBS Sports NFL',
        url: 'https://www.cbssports.com/rss/headlines/nfl/',
    },
    {
        name: 'Pro Football Talk',
        url: 'https://profootballtalk.nbcsports.com/feed/',
    },
]

// Keywords for category detection
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    trades: ['trade', 'traded', 'trading', 'deal', 'acquire', 'acquired', 'swap', 'exchange'],
    coaching: ['coach', 'coaching', 'hire', 'hired', 'fire', 'fired', 'coordinator', 'staff', 'head coach'],
    injuries: ['injury', 'injured', 'hurt', 'out for', 'torn', 'surgery', 'IR', 'concussion', 'questionable', 'doubtful'],
    'free-agency': ['free agent', 'free agency', 'signs', 'signed', 'contract', 'extension', 'release', 'released', 'cut'],
    draft: ['draft', 'pick', 'prospect', 'combine', 'mock draft', 'first round', 'selection'],
    superbowl: ['super bowl', 'superbowl', 'championship', 'playoffs', 'postseason', 'nfc championship', 'afc championship'],
    'player-news': ['suspended', 'arrest', 'fine', 'fined', 'controversy', 'retirement', 'retires', 'holdout'],
    'team-news': ['stadium', 'relocation', 'owner', 'ownership', 'franchise'],
}

// Important keywords that indicate newsworthy content
export const PRIORITY_KEYWORDS = [
    'breaking',
    'official',
    'confirmed',
    'announced',
    'report',
    'sources',
    'exclusive',
    'just in',
    'update',
]

// Paths
export const ARTICLES_DIR = 'public/json_data/articles'
export const STATE_FILE = 'public/json_data/news_state.json'
export const INDEX_FILE = 'public/json_data/articles_index.json'

// Similarity threshold for deduplication (0-1, higher = stricter matching)
// Increased to 0.45 for more aggressive grouping of related stories
export const SIMILARITY_THRESHOLD = 0.45

// Maximum age of articles to process (in hours)
export const MAX_ARTICLE_AGE_HOURS = 72

// Rate limiting - delay between feed fetches (ms)
export const FETCH_DELAY_MS = 1000

// Category-based article limits per day
// Narrow topics (Super Bowl, specific events) get fewer articles
// Broader topics (player moves, injuries) get more
export const CATEGORY_LIMITS: Record<string, number> = {
    superbowl: 5,       // Concentrated event - limit to top stories
    draft: 8,           // Seasonal event - moderate limit
    'team-news': 8,     // Ownership/stadium news - less frequent
    trades: 15,         // Important transactions - medium limit
    coaching: 15,       // Coaching changes - medium limit
    'free-agency': 20,  // Many player moves - higher limit
    injuries: 25,       // Ongoing updates - higher limit
    'player-news': 25,  // Broad category - higher limit
    general: 30,        // Catch-all - highest limit
}

// Default limit for categories not specified
export const DEFAULT_CATEGORY_LIMIT = 15
