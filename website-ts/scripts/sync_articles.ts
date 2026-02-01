// NFL News - Sync Index from Articles Folder
// Rebuilds the articles_index.json and news_state.json from actual article files
// Use this after manually adding articles to the folder

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as crypto from 'crypto'

// Get proper base directory (website-ts root)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '..')

const ARTICLES_DIR = path.join(WEBSITE_ROOT, 'public/json_data/articles')
const INDEX_FILE = path.join(WEBSITE_ROOT, 'public/json_data/articles_index.json')
const STATE_FILE = path.join(WEBSITE_ROOT, 'public/json_data/news_state.json')

interface ArticleMetadata {
    id: string
    title: string
    slug: string
    date: string
    category: string
    sources: string[]
    hash: string
    aiGenerated: boolean
    summary: string
}

// Generate a hash for an article
function generateHash(title: string, content: string): string {
    const normalized = (title + ' ' + content).toLowerCase().replace(/[^\w\s]/g, '').trim()
    return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 16)
}

// Generate a unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// Parse frontmatter from markdown file
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } | null {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
    if (!match) return null

    const frontmatterText = match[1]
    const body = match[2]

    const frontmatter: Record<string, any> = {}

    // Parse title
    const titleMatch = frontmatterText.match(/title:\s*"([^"]*)"/)
    if (titleMatch) frontmatter.title = titleMatch[1]

    // Parse date
    const dateMatch = frontmatterText.match(/date:\s*(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) frontmatter.date = dateMatch[1]

    // Parse category
    const categoryMatch = frontmatterText.match(/category:\s*(\S+)/)
    if (categoryMatch) frontmatter.category = categoryMatch[1]

    // Parse aiGenerated
    const aiMatch = frontmatterText.match(/aiGenerated:\s*(true|false)/)
    frontmatter.aiGenerated = aiMatch ? aiMatch[1] === 'true' : false

    // Parse sources (simplified - just get names)
    const sources: string[] = []
    const sourceBlocks = frontmatterText.match(/sources:[\s\S]*?(?=tags:|$)/)?.[0] || ''
    const sourceNames = sourceBlocks.match(/name:\s*"([^"]*)"/g)
    if (sourceNames) {
        sourceNames.forEach(s => {
            const name = s.match(/name:\s*"([^"]*)"/)?.[1]
            if (name) sources.push(name)
        })
    }
    frontmatter.sources = sources

    // Parse tags
    const tagsMatch = frontmatterText.match(/tags:\s*\[(.*?)\]/)
    if (tagsMatch) {
        frontmatter.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, ''))
    }

    return { frontmatter, body }
}

// Extract summary from body
function extractSummary(body: string): string {
    // Find the first paragraph after the category line
    const lines = body.split('\n')
    let captureNext = false
    let summary = ''

    for (const line of lines) {
        if (line.includes('**Category:**')) {
            captureNext = true
            continue
        }
        if (captureNext && line.trim().length > 20) {
            summary = line.trim()
            break
        }
    }

    if (summary.length > 200) {
        return summary.substring(0, 197) + '...'
    }
    return summary || 'No summary available.'
}

// Extract slug from filename
function extractSlugFromFilename(filename: string): string {
    // Format: YYYY-MM-DD-slug.md
    return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
}

function syncIndex(): void {
    console.log('\n🔄 Syncing articles index from folder...')
    console.log(`📂 Articles folder: ${ARTICLES_DIR}`)

    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('❌ Articles folder not found!')
        process.exit(1)
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
    console.log(`📄 Found ${files.length} markdown files`)

    const articles: ArticleMetadata[] = []
    const hashes: string[] = []

    for (const filename of files) {
        const filepath = path.join(ARTICLES_DIR, filename)
        const content = fs.readFileSync(filepath, 'utf-8')

        const parsed = parseFrontmatter(content)
        if (!parsed) {
            console.warn(`  ⚠️ Could not parse frontmatter: ${filename}`)
            continue
        }

        const { frontmatter, body } = parsed

        const title = frontmatter.title || filename
        const date = frontmatter.date || filename.substring(0, 10)
        const category = frontmatter.category || 'general'
        const aiGenerated = frontmatter.aiGenerated === true
        const sources = frontmatter.sources || []
        const slug = extractSlugFromFilename(filename)
        const summary = extractSummary(body)
        const hash = generateHash(title, body.substring(0, 500))

        articles.push({
            id: generateId(),
            title,
            slug,
            date,
            category,
            sources,
            hash,
            aiGenerated,
            summary
        })

        hashes.push(hash)
        console.log(`  ✓ ${filename}`)
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Write index
    const index = {
        lastUpdated: new Date().toISOString(),
        count: articles.length,
        articles
    }
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2))
    console.log(`\n📋 Updated index: ${articles.length} articles`)

    // Write state
    const state = {
        lastRun: new Date().toISOString(),
        processedHashes: hashes,
        articles
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
    console.log(`💾 Updated state: ${hashes.length} hashes`)

    console.log('\n✅ Sync complete!')
}

syncIndex()
