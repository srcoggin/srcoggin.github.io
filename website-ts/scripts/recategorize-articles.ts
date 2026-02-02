// Recategorize articles based on their content and title
// This script analyzes article titles/content and assigns proper categories

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '..')
const ARTICLES_DIR = path.join(WEBSITE_ROOT, 'public', 'json_data', 'articles')

// Category keywords - order matters (more specific first)
const CATEGORY_RULES = [
    {
        category: 'injuries',
        keywords: ['injury', 'injured', 'hurt', 'ir ', 'questionable', 'doubtful', 'out for'],
        weight: 10
    },
    {
        category: 'superbowl',
        keywords: ['super bowl', 'sb lx', 'super bowl lx', 'championship game'],
        weight: 10
    },
    {
        category: 'draft',
        keywords: ['draft', 'senior bowl', 'combine', 'mock draft', 'prospect', 'nfl draft'],
        excludeKeywords: ['draft pick signed', 'drafted in'],
        weight: 9
    },
    {
        category: 'coaching',
        keywords: ['coach', 'coordinator', 'hire', 'offensive coordinator', 'defensive coordinator', 'hc', 'special teams'],
        weight: 8
    },
    {
        category: 'trades',
        keywords: ['trade', 'traded', 'deal', 'contract', 'extension', 'salary cap', 'cap space'],
        excludeKeywords: ['draft deal'],
        weight: 7
    },
    {
        category: 'free-agency',
        keywords: ['free agent', 'free agency', 'sign', 'signing', 'unrestricted'],
        weight: 7
    },
    {
        category: 'player-news',
        keywords: ['mvp', 'pro bowl', 'awards', 'accolades', 'performance', 'stats', 'record'],
        weight: 6
    },
    {
        category: 'team-news',
        keywords: ['ownership', 'stadium', 'relocation', 'franchise', 'front office'],
        weight: 6
    },
    {
        category: 'general',
        keywords: [], // catch-all
        weight: 1
    }
]

function categorizeArticle(title: string, content: string): string {
    const titleLower = title.toLowerCase()
    const contentLower = content.toLowerCase()

    let bestCategory = 'general'
    let bestScore = 0

    for (const rule of CATEGORY_RULES) {
        // Check exclude keywords first
        if (rule.excludeKeywords) {
            const hasExclude = rule.excludeKeywords.some(keyword =>
                titleLower.includes(keyword.toLowerCase()) ||
                contentLower.includes(keyword.toLowerCase())
            )
            if (hasExclude) continue
        }

        // Count matching keywords - heavily weight title matches
        let titleMatches = 0
        let contentMatches = 0

        for (const keyword of rule.keywords) {
            const keywordLower = keyword.toLowerCase()
            if (titleLower.includes(keywordLower)) {
                titleMatches++
            } else if (contentLower.includes(keywordLower)) {
                contentMatches++
            }
        }

        // Title matches are worth 3x more than content matches
        const totalMatches = (titleMatches * 3) + contentMatches

        if (totalMatches > 0) {
            const score = totalMatches * rule.weight
            if (score > bestScore) {
                bestScore = score
                bestCategory = rule.category
            }
        }
    }

    return bestCategory
}

async function recategorizeArticles() {
    console.log('\n📂 Recategorizing articles based on content...')
    console.log('='.repeat(60))

    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('❌ Articles directory not found')
        return
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
    console.log(`📄 Found ${files.length} article files\n`)

    let changedCount = 0
    const changes: Array<{ file: string, old: string, new: string }> = []

    for (const filename of files) {
        const filepath = path.join(ARTICLES_DIR, filename)
        const content = fs.readFileSync(filepath, 'utf-8')

        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
        if (!frontmatterMatch) {
            console.log(`⚠️  Skipping ${filename} - no frontmatter found`)
            continue
        }

        const frontmatter = frontmatterMatch[1]
        const body = content.substring(frontmatterMatch[0].length)

        // Extract title and current category
        const titleMatch = frontmatter.match(/^title:\s*"((?:[^"\\]|\\.)*)"\s*$/m)
        const categoryMatch = frontmatter.match(/^category:\s*(.+?)\s*$/m)

        if (!titleMatch || !categoryMatch) {
            console.log(`⚠️  Skipping ${filename} - missing title or category`)
            continue
        }

        const title = titleMatch[1].replace(/\\"/g, '"')
        const oldCategory = categoryMatch[1]

        // Determine new category
        const newCategory = categorizeArticle(title, body)

        if (oldCategory !== newCategory) {
            // Update category in frontmatter
            const newFrontmatter = frontmatter.replace(
                /^category:\s*.+?\s*$/m,
                `category: ${newCategory}`
            )

            // Reconstruct content
            const lineEnding = content.includes('\r\n') ? '\r\n' : '\n'
            const newContent = `---${lineEnding}${newFrontmatter}${lineEnding}---${lineEnding}${body}`

            fs.writeFileSync(filepath, newContent)

            changes.push({
                file: filename,
                old: oldCategory,
                new: newCategory
            })

            changedCount++
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Complete!`)
    console.log(`   📝 Recategorized ${changedCount} articles\n`)

    if (changes.length > 0) {
        console.log('Changes made:')
        changes.forEach(change => {
            console.log(`  • ${change.file}`)
            console.log(`    ${change.old} → ${change.new}`)
        })
    }

    console.log('\n' + '='.repeat(60))
    console.log('💡 Next step: Run the news scraper to update the index:')
    console.log('   npm run scrape-news')
}

recategorizeArticles()
