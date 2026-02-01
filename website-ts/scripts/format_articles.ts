// Article Formatter - Clean up article markdown files for better display
// Removes duplicate title and category lines, cleans up body content

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '..')

const ARTICLES_DIR = path.join(WEBSITE_ROOT, 'public/json_data/articles')

function cleanArticleBody(content: string): string {
    // Match frontmatter
    const match = content.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/)
    if (!match) return content

    const frontmatter = match[1]
    let body = match[2]

    // Remove duplicate title (# Title at start of body)
    body = body.replace(/^\s*#\s+[^\n]+\r?\n\r?\n?/, '')

    // Remove **Category:** line
    body = body.replace(/^\s*\*\*Category:\*\*[^\n]*\r?\n\r?\n?/, '')

    // Remove leading/trailing whitespace but ensure proper spacing
    body = body.trim()

    // Ensure proper paragraph spacing
    body = body.replace(/\r\n/g, '\n') // Normalize line endings
    body = body.replace(/\n{3,}/g, '\n\n') // Max 2 newlines between paragraphs

    // Clean up the AI attribution footer - make it nicer
    body = body.replace(/\n*---\s*\n+\*This article was generated using AI based on reporting from ([^*]+)\.\*\s*\.?\s*$/,
        '\n\n---\n\n*AI-generated summary based on reporting from $1.*')

    // Remove any trailing periods that got added incorrectly
    body = body.replace(/\n\.\s*$/, '')

    return frontmatter + '\n' + body + '\n'
}

function formatAllArticles(): void {
    console.log('\n📝 Formatting articles for cleaner display...')
    console.log(`📂 Articles folder: ${ARTICLES_DIR}`)

    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('❌ Articles folder not found!')
        process.exit(1)
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
    console.log(`📄 Found ${files.length} markdown files\n`)

    let formatted = 0

    for (const filename of files) {
        const filepath = path.join(ARTICLES_DIR, filename)
        const original = fs.readFileSync(filepath, 'utf-8')
        const cleaned = cleanArticleBody(original)

        if (cleaned !== original) {
            fs.writeFileSync(filepath, cleaned)
            console.log(`  ✓ Cleaned: ${filename}`)
            formatted++
        } else {
            console.log(`  - Already clean: ${filename}`)
        }
    }

    console.log(`\n✅ Formatted ${formatted} articles`)
}

formatAllArticles()
