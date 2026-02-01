// NFL News Scraper - Article Generator

import { ProcessedArticle, ArticleCategory, ArticleSource } from './types'
import { ArticleGroup, extractSources, generateSlug, extractTags, generateHash } from './deduplicator'
import { generateWithGemini, isGeminiAvailable } from './gemini'

// Category display names
const CATEGORY_NAMES: Record<ArticleCategory, string> = {
    trades: 'Trades & Transactions',
    coaching: 'Coaching News',
    injuries: 'Injury Reports',
    'free-agency': 'Free Agency',
    draft: 'NFL Draft',
    superbowl: 'Playoffs & Super Bowl',
    'player-news': 'Player News',
    'team-news': 'Team News',
    general: 'NFL News',
}

// Generate a unique article ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// Get current date in YYYY-MM-DD format
function getDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

// Merge descriptions from multiple sources (fallback when Gemini unavailable)
function mergeDescriptions(group: ArticleGroup): string {
    const descriptions: string[] = []

    // Add primary description
    if (group.primary.description) {
        descriptions.push(group.primary.description)
    }

    // Add unique content from related articles
    for (const related of group.related) {
        if (related.description && !descriptions.some(d =>
            d.toLowerCase().includes(related.description.toLowerCase().substring(0, 50)) ||
            related.description.toLowerCase().includes(d.toLowerCase().substring(0, 50))
        )) {
            descriptions.push(related.description)
        }
    }

    return descriptions.join('\n\n')
}

// Generate title - prefer the most descriptive one
function generateTitle(group: ArticleGroup): string {
    // If we have multiple sources, they might have different angles
    // Pick the longest/most descriptive title
    let bestTitle = group.primary.title

    for (const related of group.related) {
        if (related.title.length > bestTitle.length) {
            bestTitle = related.title
        }
    }

    return bestTitle
}

// Generate markdown content for the article
function generateMarkdownContent(
    title: string,
    category: ArticleCategory,
    mainContent: string,
    sources: ArticleSource[],
    tags: string[],
    aiGenerated: boolean = false
): string {
    const categoryName = CATEGORY_NAMES[category]

    let content = `# ${title}\n\n`

    // Add category badge
    content += `**Category:** ${categoryName}\n\n`

    // Main content
    if (aiGenerated) {
        content += mainContent + '\n\n'
    } else {
        content += `## Summary\n\n`
        content += mainContent + '\n\n'
    }

    // If multiple sources, add a note about merged reporting
    if (sources.length > 1) {
        content += `## Sources\n\n`
        content += `This story is being reported by ${sources.length} sources:\n\n`
        for (const source of sources) {
            content += `- **${source.name}**: [${truncateTitle(source.title)}](${source.url})\n`
        }
        content += '\n'
    }

    // Attribution footer
    content += `---\n\n`
    if (aiGenerated) {
        content += `*This article was generated using AI based on reporting from ${sources.map(s => s.name).join(', ')}.*\n`
    } else {
        content += `*This article was compiled from multiple sources. Original reporting by ${sources.map(s => s.name).join(', ')}.*\n`
    }

    return content
}

// Truncate title for display
function truncateTitle(title: string, maxLength: number = 60): string {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength - 3) + '...'
}

// Generate frontmatter for markdown
function generateFrontmatter(
    title: string,
    date: string,
    category: ArticleCategory,
    sources: ArticleSource[],
    tags: string[],
    aiGenerated: boolean = false
): string {
    const sourcesList = sources.map(s => `\n  - name: "${s.name}"\n    url: "${s.url}"`).join('')
    const tagsList = tags.map(t => `"${t}"`).join(', ')

    return `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
category: ${category}
aiGenerated: ${aiGenerated}
sources:${sourcesList}
tags: [${tagsList}]
---

`
}

// Process an article group into a processed article
export async function processArticleGroup(group: ArticleGroup): Promise<ProcessedArticle> {
    const title = generateTitle(group)
    const slug = generateSlug(title)
    const date = getDateString()
    const sources = extractSources(group)
    const tags = extractTags(group.keywords, group.category)
    const hash = generateHash(title, group.primary.description)

    let mainContent: string
    let aiGenerated = false

    // Try Gemini generation first
    if (isGeminiAvailable() && sources.length >= 1) {
        const sourceData = [
            {
                name: group.primary.source,
                title: group.primary.title,
                description: group.primary.description,
                url: group.primary.link
            },
            ...group.related.map(r => ({
                name: r.source,
                title: r.title,
                description: r.description,
                url: r.link
            }))
        ]

        const geminiContent = await generateWithGemini(
            title,
            sourceData,
            CATEGORY_NAMES[group.category]
        )

        if (geminiContent) {
            mainContent = geminiContent
            aiGenerated = true
        } else {
            mainContent = mergeDescriptions(group)
        }
    } else {
        mainContent = mergeDescriptions(group)
    }

    const markdownContent = generateMarkdownContent(
        title,
        group.category,
        mainContent,
        sources,
        tags,
        aiGenerated
    )

    const frontmatter = generateFrontmatter(title, date, group.category, sources, tags, aiGenerated)
    const fullContent = frontmatter + markdownContent

    return {
        id: generateId(),
        title,
        slug,
        date,
        category: group.category,
        summary: mainContent.substring(0, 200) + (mainContent.length > 200 ? '...' : ''),
        content: fullContent,
        sources,
        tags,
        hash,
        aiGenerated,
    }
}

// Generate filename for article
export function generateFilename(article: ProcessedArticle): string {
    return `${article.date}-${article.slug}.md`
}
