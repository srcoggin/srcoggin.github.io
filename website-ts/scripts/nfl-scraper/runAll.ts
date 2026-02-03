// NFL News Scraper - Unified Runner v3
// Follows exact 6-step process with UnGenerated queue:
// 0. Process any pending UnGenerated articles first
// 1. Sync state with actual files
// 2. Scrape RSS feeds
// 3. Merge similar articles
// 4. Generate with AI (queues failures for manual generation)
// 5. Save to articles folder
// 6. Archive old articles (>14 days)

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { fetchAllFeeds, filterByAge } from './fetchRSS'
import { groupRelatedArticles, generateHash, ArticleGroup, generateSlug, extractSources, extractTags, decodeHTMLEntities } from './deduplicator'
import { generateFilename } from './articleGenerator'
import { NewsState, ArticleMetadata, ProcessedArticle, ArticleCategory, ArticleSource } from './types'
import {
    ARTICLES_DIR,
    STATE_FILE,
    INDEX_FILE,
    MAX_ARTICLE_AGE_HOURS,
    CATEGORY_LIMITS,
    DEFAULT_CATEGORY_LIMIT,
    OLD_ARTICLES_DIR,
    ARCHIVE_AGE_DAYS,
    UNGENERATED_DIR
} from './config'
import { generateWithChatGPT, isChatGPTAvailable } from './chatgpt'

// Get proper base directory (website-ts root)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '../..')

// Resolve paths relative to website root
function resolvePath(relativePath: string): string {
    return path.resolve(WEBSITE_ROOT, relativePath)
}

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

// Interface for queued/ungenerated article data
interface UnGeneratedArticle {
    title: string
    category: ArticleCategory
    sources: Array<{ name: string; title: string; description: string; url: string }>
    keywords: string[]
    hash: string
    queuedAt: string
}

// ============================================================================
// STEP 0: Process any pending UnGenerated articles
// ============================================================================

async function processPendingQueue(state: NewsState): Promise<{ processedCount: number; failedCount: number }> {
    console.log('\n📋 Step 0: Checking for pending UnGenerated articles...')

    if (!fs.existsSync(UNGENERATED_DIR)) {
        console.log('  ✓ No UnGenerated queue folder found')
        return { processedCount: 0, failedCount: 0 }
    }

    const pendingFiles = fs.readdirSync(UNGENERATED_DIR).filter(f => f.endsWith('.json'))

    if (pendingFiles.length === 0) {
        console.log('  ✓ Queue is empty')
        return { processedCount: 0, failedCount: 0 }
    }

    console.log(`  📄 Found ${pendingFiles.length} pending articles to process`)

    let processedCount = 0
    let failedCount = 0
    const processedHashes = new Set(state.processedHashes)

    for (const file of pendingFiles) {
        const filepath = path.join(UNGENERATED_DIR, file)
        try {
            const data: UnGeneratedArticle = JSON.parse(fs.readFileSync(filepath, 'utf-8'))

            // Check 1: Hash match (exact duplicate content)
            if (processedHashes.has(data.hash)) {
                console.log(`  ⏭️ Already processed (hash match): ${data.title.substring(0, 40)}...`)
                fs.unlinkSync(filepath)
                continue
            }

            // Check 2: Slug match (file already exists)
            // This prevents re-generating an article that was already saved but maybe hash didn't sync 
            const slug = generateSlug(data.title)
            const date = getDateString()
            // Check for any file ending with this slug, regardless of date prefix
            const articlesDir = resolvePath(ARTICLES_DIR)
            const existingFiles = fs.readdirSync(articlesDir)
            const exists = existingFiles.some(f => f.includes(slug))

            if (exists) {
                console.log(`  ⏭️ Already processed (file exists): ${data.title.substring(0, 40)}...`)
                // Add to processed hashes to prevent future attempts in this run
                processedHashes.add(data.hash)
                state.processedHashes.push(data.hash)
                fs.unlinkSync(filepath)
                continue
            }

            // Try to generate with AI
            const aiContent = await generateWithChatGPT(
                data.title,
                data.sources,
                CATEGORY_NAMES[data.category]
            )

            if (aiContent) {
                // Successfully generated - create article
                const article = createArticleFromQueueData(data, aiContent)
                saveArticle(article)

                // Update state
                processedHashes.add(article.hash)
                state.processedHashes.push(article.hash)
                state.articles.push({
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    date: article.date,
                    category: article.category,
                    sources: article.sources.map(s => s.name),
                    hash: article.hash,
                    aiGenerated: true,
                    summary: article.summary,
                })

                // Remove from queue
                fs.unlinkSync(filepath)
                processedCount++
                console.log(`  ✅ Generated from queue: ${data.title.substring(0, 40)}...`)
            } else {
                // Still can't generate - leave in queue
                failedCount++
                console.log(`  ⏳ Still pending: ${data.title.substring(0, 40)}...`)
            }
        } catch (error) {
            console.error(`  ⚠️ Error processing ${file}:`, error)
            failedCount++
        }
    }

    console.log(`  ✓ Queue: ${processedCount} generated, ${failedCount} still pending`)
    return { processedCount, failedCount }
}

// ============================================================================
// STEP 1: Sync state with actual article files
// ============================================================================

function syncStateWithFiles(state: NewsState): { removedCount: number } {
    console.log('\n📋 Step 1: Syncing state with article files...')

    const articlesPath = resolvePath(ARTICLES_DIR)

    // Get list of actual files in articles folder
    const actualFiles = new Set<string>()
    if (fs.existsSync(articlesPath)) {
        fs.readdirSync(articlesPath).forEach(file => {
            if (file.endsWith('.md')) {
                actualFiles.add(file)
            }
        })
    }

    const originalCount = state.articles.length
    const validArticles: ArticleMetadata[] = []
    const validHashes: string[] = []

    // Keep only articles that have corresponding files
    for (const article of state.articles) {
        const filename = `${article.date}-${article.slug}.md`
        if (actualFiles.has(filename)) {
            validArticles.push(article)
            validHashes.push(article.hash)
        } else {
            console.log(`  🗑️ Removed orphan state entry: ${filename}`)
        }
    }

    state.articles = validArticles
    state.processedHashes = validHashes

    const removedCount = originalCount - validArticles.length
    console.log(`  ✓ State synced: ${validArticles.length} valid, ${removedCount} removed`)

    return { removedCount }
}

// ============================================================================
// STEP 4 & 5: Generate with AI and save (or queue for manual)
// ============================================================================

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function getDateString(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
}

function generateTitle(group: ArticleGroup): string {
    let bestTitle = group.primary.title
    for (const related of group.related) {
        if (related.title.length > bestTitle.length) {
            bestTitle = related.title
        }
    }
    // Decode HTML entities in title
    return decodeHTMLEntities(bestTitle)
}

function generateMarkdownContent(
    title: string,
    category: ArticleCategory,
    aiContent: string,
    sources: ArticleSource[],
    tags: string[]
): string {
    // NOTE: Title and category are in frontmatter - React renders them as header
    // Don't duplicate them in the body markdown

    let content = aiContent + '\n\n'

    // Only show sources section if multiple sources
    if (sources.length > 1) {
        content += `---\n\n`
        content += `### Sources\n\n`
        for (const source of sources) {
            const truncatedTitle = source.title.length > 60
                ? source.title.substring(0, 57) + '...'
                : source.title
            content += `- **${source.name}**: [${truncatedTitle}](${source.url})\n`
        }
        content += '\n'
    }

    content += `---\n\n`
    content += `*AI-generated summary based on reporting from ${sources.map(s => s.name).join(', ')}.*\n`

    return content
}

function generateFrontmatter(
    title: string,
    date: string,
    category: ArticleCategory,
    sources: ArticleSource[],
    tags: string[]
): string {
    const sourcesList = sources.map(s => `\n  - name: "${s.name}"\n    url: "${s.url}"`).join('')
    const tagsList = tags.map(t => `"${t}"`).join(', ')

    return `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
category: ${category}
aiGenerated: true
sources:${sourcesList}
tags: [${tagsList}]
---

`
}

function createArticleFromQueueData(data: UnGeneratedArticle, aiContent: string): ProcessedArticle {
    const slug = generateSlug(data.title)
    const date = getDateString()
    const sources: ArticleSource[] = data.sources.map(s => ({
        name: s.name,
        url: s.url,
        title: s.title
    }))
    const tags = extractTags(new Set(data.keywords), data.category)

    const markdownContent = generateMarkdownContent(data.title, data.category, aiContent, sources, tags)
    const frontmatter = generateFrontmatter(data.title, date, data.category, sources, tags)
    const fullContent = frontmatter + markdownContent

    return {
        id: generateId(),
        title: data.title,
        slug,
        date,
        category: data.category,
        summary: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
        content: fullContent,
        sources,
        tags,
        hash: data.hash,
        aiGenerated: true,
    }
}

async function processGroupWithAI(group: ArticleGroup): Promise<ProcessedArticle | null> {
    const title = generateTitle(group)
    const slug = generateSlug(title)
    const date = getDateString()
    const sources = extractSources(group)
    const tags = extractTags(group.keywords, group.category)
    const hash = generateHash(title, group.primary.description)

    // Prepare source data for ChatGPT
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

    // Call ChatGPT
    const aiContent = await generateWithChatGPT(
        title,
        sourceData,
        CATEGORY_NAMES[group.category]
    )

    // If AI fails, return null - caller will queue it
    if (!aiContent) {
        return null
    }

    const markdownContent = generateMarkdownContent(title, group.category, aiContent, sources, tags)
    const frontmatter = generateFrontmatter(title, date, group.category, sources, tags)
    const fullContent = frontmatter + markdownContent

    return {
        id: generateId(),
        title,
        slug,
        date,
        category: group.category,
        summary: aiContent.substring(0, 200) + (aiContent.length > 200 ? '...' : ''),
        content: fullContent,
        sources,
        tags,
        hash,
        aiGenerated: true,
    }
}

function queueForManualGeneration(group: ArticleGroup): void {
    // Ensure queue directory exists
    if (!fs.existsSync(UNGENERATED_DIR)) {
        fs.mkdirSync(UNGENERATED_DIR, { recursive: true })
    }

    const title = generateTitle(group)
    const hash = generateHash(title, group.primary.description)
    const slug = generateSlug(title)

    const queueData: UnGeneratedArticle = {
        title,
        category: group.category,
        sources: [
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
        ],
        keywords: Array.from(group.keywords),
        hash,
        queuedAt: new Date().toISOString()
    }

    const filename = `${getDateString()}-${slug}.json`
    const filepath = path.join(UNGENERATED_DIR, filename)
    fs.writeFileSync(filepath, JSON.stringify(queueData, null, 2))
    console.log(`  📥 Queued for manual: ${filename}`)
}

function saveArticle(article: ProcessedArticle): string {
    const filename = generateFilename(article)
    const filepath = resolvePath(path.join(ARTICLES_DIR, filename))
    fs.writeFileSync(filepath, article.content)
    console.log(`  ✓ Saved: ${filename}`)
    return filename
}

// ============================================================================
// STEP 6: Archive old articles (>14 days)
// ============================================================================

function archiveOldArticles(state: NewsState): { archivedCount: number } {
    console.log('\n📦 Step 6: Archiving old articles...')

    const articlesPath = resolvePath(ARTICLES_DIR)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_AGE_DAYS)

    const archivedFiles: string[] = []
    const articlesToKeep: ArticleMetadata[] = []
    const hashesToRemove: Set<string> = new Set()

    // Ensure old articles directory exists
    if (!fs.existsSync(OLD_ARTICLES_DIR)) {
        fs.mkdirSync(OLD_ARTICLES_DIR, { recursive: true })
        console.log(`  📁 Created archive directory: ${OLD_ARTICLES_DIR}`)
    }

    // Check each article in state
    for (const article of state.articles) {
        const articleDate = new Date(article.date)

        if (articleDate < cutoffDate) {
            const filename = `${article.date}-${article.slug}.md`
            const sourcePath = path.join(articlesPath, filename)
            const destPath = path.join(OLD_ARTICLES_DIR, filename)

            if (fs.existsSync(sourcePath)) {
                try {
                    fs.copyFileSync(sourcePath, destPath)
                    fs.unlinkSync(sourcePath)
                    archivedFiles.push(filename)
                    hashesToRemove.add(article.hash)
                    console.log(`  📤 Archived: ${filename}`)
                } catch (error) {
                    console.error(`  ⚠️ Failed to archive ${filename}:`, error)
                    articlesToKeep.push(article)
                }
            } else {
                hashesToRemove.add(article.hash)
            }
        } else {
            articlesToKeep.push(article)
        }
    }

    state.articles = articlesToKeep
    state.processedHashes = state.processedHashes.filter(h => !hashesToRemove.has(h))

    console.log(`  ✓ Archived ${archivedFiles.length} articles older than ${ARCHIVE_AGE_DAYS} days`)

    return { archivedCount: archivedFiles.length }
}

// ============================================================================
// Helper functions
// ============================================================================

function ensureDirectories(): void {
    const articlesPath = resolvePath(ARTICLES_DIR)
    if (!fs.existsSync(articlesPath)) {
        fs.mkdirSync(articlesPath, { recursive: true })
        console.log(`📁 Created articles directory: ${articlesPath}`)
    }
}

function loadState(): NewsState {
    const statePath = resolvePath(STATE_FILE)
    if (fs.existsSync(statePath)) {
        try {
            const content = fs.readFileSync(statePath, 'utf-8')
            return JSON.parse(content)
        } catch (error) {
            console.warn('⚠️ Could not parse state file, starting fresh')
        }
    }
    return {
        lastRun: new Date().toISOString(),
        processedHashes: [],
        articles: [],
    }
}

function saveState(state: NewsState): void {
    const statePath = resolvePath(STATE_FILE)
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
    console.log(`💾 Saved state to ${statePath}`)
}

function updateIndex(articles: ArticleMetadata[]): void {
    const indexPath = resolvePath(INDEX_FILE)
    const sortedArticles = [...articles].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const index = {
        lastUpdated: new Date().toISOString(),
        count: sortedArticles.length,
        articles: sortedArticles,
    }
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
    console.log(`📋 Updated index: ${articles.length} articles`)
}

function countTodayArticlesByCategory(state: NewsState): Map<string, number> {
    const today = new Date().toISOString().split('T')[0]
    const counts = new Map<string, number>()
    for (const article of state.articles) {
        if (article.date === today) {
            const current = counts.get(article.category) || 0
            counts.set(article.category, current + 1)
        }
    }
    return counts
}

function isCategoryAtLimit(category: string, categoryCounts: Map<string, number>): boolean {
    const limit = CATEGORY_LIMITS[category] || DEFAULT_CATEGORY_LIMIT
    const current = categoryCounts.get(category) || 0
    return current >= limit
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
    console.log('\n🏈 NFL News Scraper v3 - AI with Queue')
    console.log('='.repeat(60))
    console.log(`📅 ${new Date().toLocaleString()}`)
    console.log(`📂 Working directory: ${WEBSITE_ROOT}`)

    // Check for ChatGPT OAuth
    if (!isChatGPTAvailable()) {
        console.warn('\n⚠️ OPENAI_REFRESH_TOKEN not set - will queue all articles for manual generation')
    } else {
        console.log('🤖 ChatGPT OAuth: Enabled')
    }

    try {
        ensureDirectories()
        const state = loadState()
        console.log(`📂 Loaded state: ${state.articles.length} articles in state`)

        // STEP 0: Process pending queue first
        const { processedCount: queueProcessed, failedCount: queueFailed } = await processPendingQueue(state)

        // STEP 1: Sync state with actual files
        const { removedCount: syncRemoved } = syncStateWithFiles(state)

        // STEP 2: Fetch all RSS feeds
        console.log('\n🔍 Step 2: Scraping RSS feeds...')
        const allItems = await fetchAllFeeds()

        if (allItems.length === 0) {
            console.log('  ⚠️ No articles fetched. Check your internet connection.')
            saveState(state)
            updateIndex(state.articles)
            return
        }

        // Filter by age
        const recentItems = filterByAge(allItems, MAX_ARTICLE_AGE_HOURS)
        console.log(`  🕐 Filtered to ${recentItems.length} articles from last ${MAX_ARTICLE_AGE_HOURS} hours`)

        // STEP 3: Group/merge related articles
        console.log('\n🔗 Step 3: Merging similar articles...')
        const groups = groupRelatedArticles(recentItems)
        console.log(`  ✓ Grouped into ${groups.length} unique stories`)

        // STEP 4 & 5: Generate with AI and save (or queue)
        console.log('\n✨ Steps 4-5: Generating articles with AI...')

        const categoryCounts = countTodayArticlesByCategory(state)
        const processedHashes = new Set(state.processedHashes)

        let newArticleCount = 0
        let skippedDuplicates = 0
        let skippedCategoryLimit = 0
        let queuedForManual = 0

        for (const group of groups) {
            // Check category limit
            if (isCategoryAtLimit(group.category, categoryCounts)) {
                skippedCategoryLimit++
                continue
            }

            // Check if already processed
            const previewHash = generateHash(group.primary.title, group.primary.description)
            if (processedHashes.has(previewHash)) {
                skippedDuplicates++
                continue
            }

            // Generate with AI
            const article = await processGroupWithAI(group)

            if (!article) {
                // AI failed - queue for manual generation
                queueForManualGeneration(group)
                queuedForManual++
                continue
            }

            // Double-check hash
            if (processedHashes.has(article.hash)) {
                skippedDuplicates++
                continue
            }

            // Save the article
            saveArticle(article)

            // Update state
            processedHashes.add(article.hash)
            state.processedHashes.push(article.hash)
            state.articles.push({
                id: article.id,
                title: article.title,
                slug: article.slug,
                date: article.date,
                category: article.category,
                sources: article.sources.map(s => s.name),
                hash: article.hash,
                aiGenerated: true,
                summary: article.summary,
            })

            // Update category count
            const currentCount = categoryCounts.get(article.category) || 0
            categoryCounts.set(article.category, currentCount + 1)
            newArticleCount++
        }

        console.log(`\n  ✓ Generated ${newArticleCount} new AI articles`)
        console.log(`  📥 Queued ${queuedForManual} for manual generation`)
        console.log(`  ⏭️ Skipped: ${skippedDuplicates} duplicates, ${skippedCategoryLimit} category limits`)

        // STEP 6: Archive old articles
        const { archivedCount } = archiveOldArticles(state)

        // Save state and update index
        state.lastRun = new Date().toISOString()
        saveState(state)
        updateIndex(state.articles)

        // Summary
        console.log('\n' + '='.repeat(60))
        console.log(`✅ Completed!`)
        console.log(`   📋 Queue processed: ${queueProcessed} (${queueFailed} still pending)`)
        console.log(`   🔄 Orphan entries removed: ${syncRemoved}`)
        console.log(`   📝 New AI articles: ${newArticleCount}`)
        console.log(`   📥 Queued for manual: ${queuedForManual}`)
        console.log(`   📦 Articles archived: ${archivedCount}`)
        console.log(`   📋 Total articles: ${state.articles.length}`)
        console.log('='.repeat(60) + '\n')

    } catch (error) {
        console.error('\n❌ Error running scraper:', error)
        process.exit(1)
    }
}

main()
