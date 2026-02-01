// NFL News Scraper - RSS Feed Fetcher

import { RSSItem, RSSFeedConfig } from './types'
import { RSS_FEEDS, FETCH_DELAY_MS } from './config'

// Simple XML parser for RSS feeds
function parseRSSXML(xml: string, sourceName: string): RSSItem[] {
    const items: RSSItem[] = []

    // Extract all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let match

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1]

        // Extract fields
        const title = extractTag(itemXml, 'title')
        const description = extractTag(itemXml, 'description')
        const link = extractTag(itemXml, 'link')
        const pubDate = extractTag(itemXml, 'pubDate')
        const category = extractTag(itemXml, 'category')

        if (title && link) {
            items.push({
                title: cleanHTML(title),
                description: cleanHTML(description || ''),
                link: link.trim(),
                pubDate: pubDate || new Date().toISOString(),
                source: sourceName,
                category: category || undefined,
            })
        }
    }

    return items
}

// Extract content from XML tag
function extractTag(xml: string, tagName: string): string | null {
    // Handle CDATA
    const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i')
    const cdataMatch = xml.match(cdataRegex)
    if (cdataMatch) {
        return cdataMatch[1]
    }

    // Handle regular content
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1] : null
}

// Clean HTML entities and tags from text
function cleanHTML(text: string): string {
    return text
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// Fetch a single RSS feed
async function fetchFeed(config: RSSFeedConfig): Promise<RSSItem[]> {
    try {
        console.log(`  Fetching: ${config.name}...`)

        const response = await fetch(config.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NFLNewsScraper/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        })

        if (!response.ok) {
            console.warn(`  ⚠️ Failed to fetch ${config.name}: ${response.status}`)
            return []
        }

        const xml = await response.text()
        const items = parseRSSXML(xml, config.name)

        console.log(`  ✓ ${config.name}: ${items.length} articles`)
        return items
    } catch (error) {
        console.error(`  ✗ Error fetching ${config.name}:`, error)
        return []
    }
}

// Delay helper
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Fetch all RSS feeds
export async function fetchAllFeeds(): Promise<RSSItem[]> {
    console.log('\n📡 Fetching RSS feeds...\n')

    const allItems: RSSItem[] = []

    for (const feed of RSS_FEEDS) {
        const items = await fetchFeed(feed)
        allItems.push(...items)

        // Rate limiting
        await delay(FETCH_DELAY_MS)
    }

    console.log(`\n📰 Total articles fetched: ${allItems.length}`)
    return allItems
}

// Filter articles by age
export function filterByAge(items: RSSItem[], maxAgeHours: number): RSSItem[] {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - maxAgeHours)

    return items.filter(item => {
        try {
            const pubDate = new Date(item.pubDate)
            return pubDate >= cutoff
        } catch {
            // If date parsing fails, include the item
            return true
        }
    })
}
