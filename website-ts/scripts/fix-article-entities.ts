// Fix HTML entities in existing article filenames and titles
// This script updates all existing articles to use proper apostrophes instead of entity codes like 039

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WEBSITE_ROOT = path.resolve(__dirname, '..')
const ARTICLES_DIR = path.join(WEBSITE_ROOT, 'public', 'json_data', 'articles')

// Decode HTML entities
function decodeHTMLEntities(text: string): string {
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

// Generate slug from title (matching deduplicator.ts logic)
function generateSlug(title: string): string {
    const decoded = decodeHTMLEntities(title)
    return decoded
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .replace(/-$/, '')
}

async function fixArticles() {
    console.log('\n🔧 Fixing HTML entities in existing articles...')
    console.log('='.repeat(60))

    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error('❌ Articles directory not found')
        return
    }

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'))
    console.log(`📄 Found ${files.length} article files\n`)

    let fixedCount = 0
    let renamedCount = 0

    for (const filename of files) {
        const filepath = path.join(ARTICLES_DIR, filename)
        const content = fs.readFileSync(filepath, 'utf-8')

        // Extract frontmatter - handle both \n and \r\n line endings
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
        if (!frontmatterMatch) {
            console.log(`⚠️  Skipping ${filename} - no frontmatter found`)
            continue
        }

        const frontmatter = frontmatterMatch[1]
        const body = content.substring(frontmatterMatch[0].length)

        // Extract and decode title - handle escaped quotes in title
        const titleMatch = frontmatter.match(/^title:\s*"((?:[^"\\]|\\.)*)"\s*$/m)
        if (!titleMatch) {
            console.log(`⚠️  Skipping ${filename} - no title found`)
            continue
        }

        const originalTitle = titleMatch[1].replace(/\\"/g, '"') // Unescape quotes
        const decodedTitle = decodeHTMLEntities(originalTitle)

        // Check if title needs fixing (only check for HTML entities, not manual edits)
        const titleHasEntities = /&#?\w+;/.test(originalTitle)

        // Extract date
        const dateMatch = frontmatter.match(/^date:\s*(.+?)\s*$/m)
        const date = dateMatch ? dateMatch[1] : ''

        // Generate new slug
        const newSlug = generateSlug(decodedTitle)
        const oldSlug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
        const slugNeedsFix = oldSlug !== newSlug && /039/.test(oldSlug)

        if (titleHasEntities || slugNeedsFix) {
            // Update frontmatter with decoded title
            let newFrontmatter = frontmatter
            if (titleHasEntities) {
                // Escape quotes in the new title
                const escapedTitle = decodedTitle.replace(/"/g, '\\"')
                newFrontmatter = newFrontmatter.replace(
                    /^title:\s*"(?:[^"\\]|\\.)*"\s*$/m,
                    `title: "${escapedTitle}"`
                )
            }

            // Reconstruct content with original line endings
            const lineEnding = content.includes('\r\n') ? '\r\n' : '\n'
            const newContent = `---${lineEnding}${newFrontmatter}${lineEnding}---${lineEnding}${body}`

            // Determine new filename
            const newFilename = `${date}-${newSlug}.md`
            const newFilepath = path.join(ARTICLES_DIR, newFilename)

            // Write updated content
            if (slugNeedsFix && filename !== newFilename) {
                // Rename file
                fs.writeFileSync(newFilepath, newContent)
                if (fs.existsSync(filepath) && filepath !== newFilepath) {
                    fs.unlinkSync(filepath)
                }
                console.log(`  ✅ Renamed: ${filename}`)
                console.log(`     → ${newFilename}`)
                renamedCount++
                fixedCount++
            } else if (titleHasEntities) {
                // Just update content
                fs.writeFileSync(filepath, newContent)
                console.log(`  ✅ Fixed title: ${filename}`)
                fixedCount++
            }
        }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Complete!`)
    console.log(`   📝 Fixed ${fixedCount} articles`)
    console.log(`   📁 Renamed ${renamedCount} files`)
    console.log('='.repeat(60) + '\n')

    if (fixedCount > 0) {
        console.log('💡 Next step: Run the news scraper to regenerate the index:')
        console.log('   npm run scrape-news')
    }
}

fixArticles()
