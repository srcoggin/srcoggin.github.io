import fs from 'fs'
import path from 'path'
import { ArticlesIndex, Article } from '../src/types' // Assuming types are accessible here or duplicate if needed

// We need to define the type locally if we can't import easily from src in this script context
// or just use 'any' for simplicity in a cleanup script, but strict typing is better.
// Let's rely on JSON structure.

interface LocalArticle {
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

interface LocalArticlesIndex {
    articles: LocalArticle[]
    lastUpdated: string
}

const INDEX_PATH = path.join(process.cwd(), 'public', 'json_data', 'articles_index.json')
const ARTICLES_DIR = path.join(process.cwd(), 'public', 'json_data', 'articles')

function cleanupArticles() {
    console.log('Starting article cleanup...')

    if (!fs.existsSync(INDEX_PATH)) {
        console.error('Articles index not found!')
        return
    }

    const indexContent = fs.readFileSync(INDEX_PATH, 'utf-8')
    const indexData: LocalArticlesIndex = JSON.parse(indexContent)

    const initialCount = indexData.articles.length
    const aiArticles: LocalArticle[] = []
    const articlesToRemove: LocalArticle[] = []

    // Filter articles
    indexData.articles.forEach(article => {
        if (article.aiGenerated) {
            aiArticles.push(article)
        } else {
            articlesToRemove.push(article)
        }
    })

    console.log(`Found ${articlesToRemove.length} non-AI articles to remove.`)
    console.log(`Keeping ${aiArticles.length} AI-generated articles.`)

    // Delete files
    let deletedCount = 0
    articlesToRemove.forEach(article => {
        const filename = `${article.date}-${article.slug}.md`
        const filePath = path.join(ARTICLES_DIR, filename)

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                deletedCount++
                // console.log(`Deleted: ${filename}`) 
            } else {
                console.warn(`File not found (skip delete): ${filename}`)
            }
        } catch (err) {
            console.error(`Failed to delete ${filename}:`, err)
        }
    })

    console.log(`Successfully deleted ${deletedCount} markdown files.`)

    // Update Index
    indexData.articles = aiArticles
    fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2))
    console.log('Updated articles_index.json')

    console.log('Cleanup complete! 🧹')
}

cleanupArticles()
