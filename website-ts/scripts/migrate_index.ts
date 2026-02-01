
import * as fs from 'fs'
import * as path from 'path'

const INDEX_FILE = 'public/json_data/articles_index.json'
const ARTICLES_DIR = 'public/json_data/articles'

function migrate() {
    const indexPath = path.resolve(process.cwd(), INDEX_FILE)
    if (!fs.existsSync(indexPath)) {
        console.error('Index file not found')
        return
    }

    const indexContent = fs.readFileSync(indexPath, 'utf-8')
    const index = JSON.parse(indexContent)

    let updatedCount = 0

    const updatedArticles = index.articles.map((article: any) => {
        // Construct filename from date and slug
        const filename = `${article.date}-${article.slug}.md`
        const filePath = path.resolve(process.cwd(), ARTICLES_DIR, filename)

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8')
            // Simple regex to check for aiGenerated: true
            const isAiGenerated = /aiGenerated:\s*true/.test(content)

            if (isAiGenerated) {
                updatedCount++

                // Extract summary
                // It is usually after **Category:** line and before ## Sources or ---
                let summary = ''
                const lines = content.split('\n')
                let startCapture = false

                for (const line of lines) {
                    if (line.includes('**Category:**')) {
                        startCapture = true
                        continue
                    }
                    if (startCapture) {
                        if (line.trim().startsWith('##') || line.trim().startsWith('---')) {
                            break
                        }
                        if (line.trim().length > 20) {
                            summary += line.trim() + ' '
                            if (summary.length > 250) break // Cap at ~250 chars for the blurb
                        }
                    }
                }

                return { ...article, aiGenerated: true, summary: summary.trim().substring(0, 200) + (summary.length > 200 ? '...' : '') }
            }
            return { ...article, aiGenerated: false }
        }
        return article
    })

    index.articles = updatedArticles
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))

    console.log(`✅ Migrated index. Updated ${updatedCount} articles to be aiGenerated: true`)
}

migrate()
