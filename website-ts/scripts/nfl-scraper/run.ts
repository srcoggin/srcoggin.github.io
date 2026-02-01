// NFL News Scraper - Main Runner

import * as fs from 'fs'
import * as path from 'path'
import { fetchAllFeeds, filterByAge } from './fetchRSS'
import { groupRelatedArticles, generateHash, ArticleGroup } from './deduplicator'
import { processArticleGroup, generateFilename } from './articleGenerator'
import { NewsState, ArticleMetadata, ProcessedArticle, ArticleCategory } from './types'
import { ARTICLES_DIR, STATE_FILE, INDEX_FILE, MAX_ARTICLE_AGE_HOURS, CATEGORY_LIMITS, DEFAULT_CATEGORY_LIMIT } from './config'
import { isGeminiAvailable } from './gemini'

// Ensure directories exist
function ensureDirectories(): void {
    const articlesPath = path.resolve(process.cwd(), ARTICLES_DIR)
    if (!fs.existsSync(articlesPath)) {
        fs.mkdirSync(articlesPath, { recursive: true })
        console.log(`📁 Created articles directory: ${articlesPath}`)
    }
}

// Load state from file
function loadState(): NewsState {
    const statePath = path.resolve(process.cwd(), STATE_FILE)

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

// Save state to file
function saveState(state: NewsState): void {
    const statePath = path.resolve(process.cwd(), STATE_FILE)
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
    console.log(`💾 Saved state to ${statePath}`)
}

// Save article to file
function saveArticle(article: ProcessedArticle): string {
    const filename = generateFilename(article)
    const filepath = path.resolve(process.cwd(), ARTICLES_DIR, filename)

    fs.writeFileSync(filepath, article.content)
    console.log(`  ✓ Saved: ${filename}`)

    return filename
}

// Update articles index for UI consumption
function updateIndex(articles: ArticleMetadata[]): void {
    const indexPath = path.resolve(process.cwd(), INDEX_FILE)

    // Sort by date descending
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

// Clean up old hashes to prevent state file from growing too large
function cleanupOldHashes(state: NewsState, maxAge: number = 7 * 24): void {
    // Keep only hashes from the last week
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - maxAge)

    state.articles = state.articles.filter(article => {
        const articleDate = new Date(article.date)
        return articleDate >= cutoffDate
    })

    // Keep only hashes that correspond to existing articles
    const existingHashes = new Set(state.articles.map(a => a.hash))
    state.processedHashes = state.processedHashes.filter(h => existingHashes.has(h))
}

// Count articles by category for today
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

// Check if category has reached its limit
function isCategoryAtLimit(category: string, categoryCounts: Map<string, number>): boolean {
    const limit = CATEGORY_LIMITS[category] || DEFAULT_CATEGORY_LIMIT
    const current = categoryCounts.get(category) || 0
    return current >= limit
}

// Main execution
async function main(): Promise<void> {
    console.log('\n🏈 NFL News Scraper')
    console.log('='.repeat(50))
    console.log(`📅 ${new Date().toLocaleString()}`)

    // Check for Gemini API
    if (isGeminiAvailable()) {
        console.log('🤖 Gemini AI: Enabled (enhanced article generation)')
    } else {
        console.log('📝 Gemini AI: Not configured (using template-based generation)')
        console.log('   Set GEMINI_API_KEY environment variable to enable AI generation')
    }
    console.log()

    try {
        // Ensure directories exist
        ensureDirectories()

        // Load previous state
        const state = loadState()
        console.log(`📂 Loaded state: ${state.processedHashes.length} previously processed articles\n`)

        // Fetch all RSS feeds
        const allItems = await fetchAllFeeds()

        if (allItems.length === 0) {
            console.log('\n⚠️ No articles fetched. Check your internet connection.')
            return
        }

        // Filter by age
        const recentItems = filterByAge(allItems, MAX_ARTICLE_AGE_HOURS)
        console.log(`\n🕐 Filtered to ${recentItems.length} articles from last ${MAX_ARTICLE_AGE_HOURS} hours`)

        if (recentItems.length === 0) {
            console.log('No recent articles to process.')
            return
        }

        // Group related articles
        const groups = groupRelatedArticles(recentItems)
        console.log(`\n🔗 Grouped into ${groups.length} unique stories`)

        // Track category counts for limiting
        const categoryCounts = countTodayArticlesByCategory(state)
        console.log('\n📊 Today\'s category counts:')
        for (const [cat, limit] of Object.entries(CATEGORY_LIMITS)) {
            const count = categoryCounts.get(cat) || 0
            console.log(`   ${cat}: ${count}/${limit}`)
        }

        // Process and save new articles
        let newArticleCount = 0
        let skippedDuplicates = 0
        let skippedCategoryLimit = 0
        const processedHashes = new Set(state.processedHashes)

        console.log('\n📝 Processing articles...\n')

        for (const group of groups) {
            // Check category limit first
            if (isCategoryAtLimit(group.category, categoryCounts)) {
                console.log(`  ⏸️ Skipped (${group.category} limit): ${group.primary.title.substring(0, 45)}...`)
                skippedCategoryLimit++
                continue
            }

            // Generate preliminary hash to check if already processed
            const previewHash = generateHash(group.primary.title, group.primary.description)

            if (processedHashes.has(previewHash)) {
                console.log(`  ⏭️ Skipped (duplicate): ${group.primary.title.substring(0, 50)}...`)
                skippedDuplicates++
                continue
            }

            // Process the article (async for Gemini integration)
            const article = await processArticleGroup(group)

            // Double-check with full hash
            if (processedHashes.has(article.hash)) {
                console.log(`  ⏭️ Skipped (duplicate): ${article.title.substring(0, 50)}...`)
                skippedDuplicates++
                continue
            }

            // Save the article
            const filename = saveArticle(article)

            // Update state and counts
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
                aiGenerated: article.aiGenerated,
                summary: article.summary,
            })

            // Update category count
            const currentCount = categoryCounts.get(article.category) || 0
            categoryCounts.set(article.category, currentCount + 1)

            newArticleCount++
        }

        // Cleanup and save state
        cleanupOldHashes(state)
        state.lastRun = new Date().toISOString()
        saveState(state)

        // Update index
        updateIndex(state.articles)

        // Summary
        console.log('\n' + '='.repeat(50))
        console.log(`✅ Completed!`)
        console.log(`   - New articles generated: ${newArticleCount}`)
        console.log(`   - Total articles in index: ${state.articles.length}`)
        console.log(`   - Skipped (duplicates): ${skippedDuplicates}`)
        console.log(`   - Skipped (category limits): ${skippedCategoryLimit}`)
        console.log('='.repeat(50) + '\n')

    } catch (error) {
        console.error('\n❌ Error running scraper:', error)
        process.exit(1)
    }
}

// Run the script
main()
