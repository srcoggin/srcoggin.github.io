
import fs from 'fs'
import path from 'path'
import ArticleViewer from '@/components/news/ArticleViewer'
import { ArticlesIndex } from '@/types'

// Generate static params for all articles
export async function generateStaticParams() {
    try {
        const indexPath = path.join(process.cwd(), 'public', 'json_data', 'articles_index.json')
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf-8')
            const data: ArticlesIndex = JSON.parse(content)
            return data.articles.map((article) => ({
                slug: article.slug,
            }))
        }
        return []
    } catch (error) {
        console.error('Error generating static params:', error)
        return []
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <ArticleViewer slug={slug} />
}
