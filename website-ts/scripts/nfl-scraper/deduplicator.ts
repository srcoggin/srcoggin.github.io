// NFL News Scraper - Deduplication and Categorization

import { RSSItem, ArticleCategory, ArticleSource } from './types'
import { CATEGORY_KEYWORDS, SIMILARITY_THRESHOLD, PRIORITY_KEYWORDS } from './config'
import * as crypto from 'crypto'

// Generate a hash for an article based on its content
export function generateHash(title: string, description: string): string {
    const normalized = normalizeText(title + ' ' + description)
    return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 16)
}

// Normalize text for comparison
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

// Extract keywords from text
function extractKeywords(text: string): Set<string> {
    const normalized = normalizeText(text)
    const words = normalized.split(' ')

    // Filter out common stop words
    const stopWords = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
        'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after',
        'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
        'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
        'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because',
        'nfl', 'football', 'team', 'player', 'game', 'season', 'week', 'year',
    ])

    return new Set(words.filter(w => w.length > 2 && !stopWords.has(w)))
}

// Calculate Jaccard similarity between two sets of keywords
function calculateSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])

    if (union.size === 0) return 0
    return intersection.size / union.size
}

// Detect article category based on content
export function detectCategory(title: string, description: string): ArticleCategory {
    const text = (title + ' ' + description).toLowerCase()

    let bestCategory: ArticleCategory = 'general'
    let bestScore = 0

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score++
            }
        }

        if (score > bestScore) {
            bestScore = score
            bestCategory = category as ArticleCategory
        }
    }

    return bestCategory
}

// Check if article is high priority (breaking news, etc.)
export function isPriorityArticle(title: string, description: string): boolean {
    const text = (title + ' ' + description).toLowerCase()
    return PRIORITY_KEYWORDS.some(keyword => text.includes(keyword))
}

// Group related articles together
export interface ArticleGroup {
    primary: RSSItem
    related: RSSItem[]
    keywords: Set<string>
    category: ArticleCategory
    isPriority: boolean
}

export function groupRelatedArticles(items: RSSItem[]): ArticleGroup[] {
    const groups: ArticleGroup[] = []
    const processedIndices = new Set<number>()

    for (let i = 0; i < items.length; i++) {
        if (processedIndices.has(i)) continue

        const item = items[i]
        const itemKeywords = extractKeywords(item.title + ' ' + item.description)
        const category = detectCategory(item.title, item.description)
        const priority = isPriorityArticle(item.title, item.description)

        const group: ArticleGroup = {
            primary: item,
            related: [],
            keywords: itemKeywords,
            category,
            isPriority: priority,
        }

        processedIndices.add(i)

        // Find related articles
        for (let j = i + 1; j < items.length; j++) {
            if (processedIndices.has(j)) continue

            const otherItem = items[j]
            const otherKeywords = extractKeywords(otherItem.title + ' ' + otherItem.description)

            const similarity = calculateSimilarity(itemKeywords, otherKeywords)

            if (similarity >= SIMILARITY_THRESHOLD) {
                group.related.push(otherItem)
                // Merge keywords
                otherKeywords.forEach(k => group.keywords.add(k))
                processedIndices.add(j)

                // Update priority if any related article is priority
                if (isPriorityArticle(otherItem.title, otherItem.description)) {
                    group.isPriority = true
                }
            }
        }

        groups.push(group)
    }

    // Sort by priority, then by number of sources
    groups.sort((a, b) => {
        if (a.isPriority !== b.isPriority) {
            return a.isPriority ? -1 : 1
        }
        return (b.related.length + 1) - (a.related.length + 1)
    })

    return groups
}

// Extract all sources from a group
export function extractSources(group: ArticleGroup): ArticleSource[] {
    const sources: ArticleSource[] = [
        {
            name: group.primary.source,
            url: group.primary.link,
            title: group.primary.title,
        },
    ]

    for (const related of group.related) {
        // Avoid duplicate sources
        if (!sources.some(s => s.name === related.source)) {
            sources.push({
                name: related.source,
                url: related.link,
                title: related.title,
            })
        }
    }

    return sources
}

// Decode common HTML entities
export function decodeHTMLEntities(text: string): string {
    return text
        .replace(/&amp;#039;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&amp;#34;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&apos;/g, "'")
}

// Generate a URL-friendly slug from title
export function generateSlug(title: string): string {
    // First decode HTML entities
    const decoded = decodeHTMLEntities(title)

    return decoded
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .replace(/-$/, '')
}

// Extract tags from keywords
export function extractTags(keywords: Set<string>, category: ArticleCategory): string[] {
    // Priority keywords to include as tags
    const tagCandidates = [
        'bills', 'chiefs', 'eagles', 'ravens', 'lions', 'cowboys', 'niners', '49ers',
        'packers', 'dolphins', 'jets', 'patriots', 'broncos', 'raiders', 'chargers',
        'bengals', 'browns', 'steelers', 'colts', 'texans', 'titans', 'jaguars',
        'saints', 'falcons', 'panthers', 'buccaneers', 'bucs', 'vikings', 'bears',
        'giants', 'commanders', 'seahawks', 'rams', 'cardinals',
        'mahomes', 'allen', 'hurts', 'lamar', 'burrow', 'herbert', 'jackson',
        'trade', 'contract', 'extension', 'injury', 'suspension', 'draft', 'playoffs',
    ]

    const tags = new Set<string>()
    tags.add(category)

    for (const candidate of tagCandidates) {
        if (keywords.has(candidate)) {
            tags.add(candidate)
        }
    }

    return Array.from(tags).slice(0, 6) // Limit to 6 tags
}
