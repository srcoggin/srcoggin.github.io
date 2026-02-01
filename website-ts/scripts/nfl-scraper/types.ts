// NFL News Scraper - Type Definitions

export interface RSSItem {
    title: string
    description: string
    link: string
    pubDate: string
    source: string
    category?: string
}

export interface ProcessedArticle {
    id: string
    title: string
    slug: string
    date: string
    category: ArticleCategory
    summary: string
    content: string
    sources: ArticleSource[]
    tags: string[]
    hash: string
    aiGenerated?: boolean
}

export interface ArticleSource {
    name: string
    url: string
    title: string
}

export type ArticleCategory =
    | 'trades'
    | 'coaching'
    | 'injuries'
    | 'free-agency'
    | 'draft'
    | 'superbowl'
    | 'player-news'
    | 'team-news'
    | 'general'

export interface NewsState {
    lastRun: string
    processedHashes: string[]
    articles: ArticleMetadata[]
}

export interface ArticleMetadata {
    id: string
    title: string
    slug: string
    date: string
    category: ArticleCategory
    sources: string[]
    hash: string
    aiGenerated?: boolean
    summary?: string
}

export interface RSSFeedConfig {
    name: string
    url: string
    category?: ArticleCategory
}
