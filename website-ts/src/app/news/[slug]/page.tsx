
import fs from 'fs'
import path from 'path'
import ArticleViewer from '@/components/news/ArticleViewer'
import { ArticlesIndex } from '@/types'

export async function generateStaticParams() {
    const slugs: { slug: string }[] = []
    try {
        const indexPath = path.join(process.cwd(), 'public', 'json_data', 'articles_index.json')
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf-8')
            const data: ArticlesIndex = JSON.parse(content)
            slugs.push(...data.articles.map((article) => ({ slug: article.slug })))
        }
    } catch (error) {
        console.error('Error generating static params:', error)
    }
    // Next.js 14 with output:'export' treats an empty return as "missing
    // generateStaticParams" (it checks prerenderRoutes.length, not function
    // existence). A fallback slug keeps the build passing when 0 articles exist;
    // ArticleViewer already handles unknown slugs gracefully.
    if (slugs.length === 0) {
        slugs.push({ slug: '_' })
    }
    return slugs
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    return <ArticleViewer slug={slug} />
}
