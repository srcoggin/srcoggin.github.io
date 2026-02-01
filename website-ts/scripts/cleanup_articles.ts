// NFL News Cleanup Script
// Removes any non-AI-generated articles from the articles folder and updates indexes

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get proper base directory (website-ts root)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '..')

interface ArticleMetadata {
    id: string
    title: string
    slug: string
    date: string
    category: string
    sources: string[]
    hash: string
    aiGenerated?: boolean
    summary?: string
}

interface ArticlesIndex {
    articles: ArticleMetadata[]
    lastUpdated: string
    count: number
}

interface NewsState {
    lastRun: string
    processedHashes: string[]
    articles: ArticleMetadata[]
}

const INDEX_PATH = path.join(WEBSITE_ROOT, 'public', 'json_data', 'articles_index.json')
const STATE_PATH = path.join(WEBSITE_ROOT, 'public', 'json_data', 'news_state.json')
const ARTICLES_DIR = path.join(WEBSITE_ROOT, 'public', 'json_data', 'articles')

function cleanupArticles() {
    console.log('\n🧹 NFL News Cleanup - Remove Non-AI Articles')
    console.log('='.repeat(50))
    console.log(`📂 Working directory: ${WEBSITE_ROOT}`)
    console.log(`📁 Articles folder: ${ARTICLES_DIR}`)

    // Check if articles folder exists
    if (!fs.existsSync(ARTICLES_DIR)) {
        console.log('\n⚠️ Articles folder does not exist. Nothing to clean.')
        return
    }

    // Load index
    let indexData: ArticlesIndex | null = null
    if (fs.existsSync(INDEX_PATH)) {
        try {
            indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'))
            console.log(`\n📋 Loaded index: ${indexData?.articles.length || 0} articles`)
        } catch (e) {
            console.error('⚠️ Could not parse index file')
        }
    } else {
        console.log('\n⚠️ No index file found')
    }

    // Load state
    let stateData: NewsState | null = null
    if (fs.existsSync(STATE_PATH)) {
        try {
            stateData = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'))
            console.log(`📋 Loaded state: ${stateData?.articles.length || 0} articles`)
        } catch (e) {
            console.error('⚠️ Could not parse state file')
        }
    } else {
        console.log('⚠️ No state file found')
    }

    // Get all markdown files in articles folder
    const allFiles = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
    console.log(`\n📄 Found ${allFiles.length} markdown files in articles folder`)

    // Track deletions
    let deletedCount = 0
    const keptFiles: string[] = []
    const deletedFiles: string[] = []

    // Check each file - read frontmatter to determine if AI generated
    for (const filename of allFiles) {
        const filepath = path.join(ARTICLES_DIR, filename)
        const content = fs.readFileSync(filepath, 'utf-8')

        // Check for aiGenerated: true in frontmatter
        const aiGeneratedMatch = content.match(/^---[\s\S]*?aiGenerated:\s*(true|false)[\s\S]*?---/m)
        const isAiGenerated = aiGeneratedMatch && aiGeneratedMatch[1] === 'true'

        if (!isAiGenerated) {
            // Delete non-AI article
            try {
                fs.unlinkSync(filepath)
                deletedFiles.push(filename)
                deletedCount++
                console.log(`  🗑️ Deleted: ${filename}`)
            } catch (err) {
                console.error(`  ⚠️ Failed to delete ${filename}:`, err)
            }
        } else {
            keptFiles.push(filename)
        }
    }

    console.log(`\n✓ Deleted ${deletedCount} non-AI articles`)
    console.log(`✓ Kept ${keptFiles.length} AI-generated articles`)

    // Update index to only include kept files
    if (indexData) {
        const deletedFilenames = new Set(deletedFiles)
        const originalCount = indexData.articles.length

        indexData.articles = indexData.articles.filter(article => {
            const filename = `${article.date}-${article.slug}.md`
            return !deletedFilenames.has(filename)
        })
        indexData.count = indexData.articles.length
        indexData.lastUpdated = new Date().toISOString()

        fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2))
        console.log(`\n📋 Updated index: ${originalCount} → ${indexData.articles.length} articles`)
    }

    // Update state to only include kept files
    if (stateData) {
        const deletedFilenames = new Set(deletedFiles)
        const hashesToRemove = new Set<string>()

        stateData.articles = stateData.articles.filter(article => {
            const filename = `${article.date}-${article.slug}.md`
            if (deletedFilenames.has(filename)) {
                hashesToRemove.add(article.hash)
                return false
            }
            return true
        })

        stateData.processedHashes = stateData.processedHashes.filter(h => !hashesToRemove.has(h))
        stateData.lastRun = new Date().toISOString()

        fs.writeFileSync(STATE_PATH, JSON.stringify(stateData, null, 2))
        console.log(`📋 Updated state: removed ${hashesToRemove.size} hash entries`)
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Cleanup complete!')
    console.log('='.repeat(50) + '\n')
}

cleanupArticles()
