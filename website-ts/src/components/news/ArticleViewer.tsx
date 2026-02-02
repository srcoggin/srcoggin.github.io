'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconChevronLeft } from '../Icons'
import ReactMarkdown from 'react-markdown'
import { Article } from '@/types'

interface ArticleViewerProps {
    slug: string
}

export default function ArticleViewer({ slug }: ArticleViewerProps) {
    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [meta, setMeta] = useState<Partial<Article> | null>(null)

    useEffect(() => {
        async function fetchArticle() {
            try {
                // First find the article date from index to construct filename
                // This is a bit inefficient, but since we only have slug from URL
                // we need to look it up or rely on convention

                const indexRes = await fetch('/json_data/articles_index.json')
                if (!indexRes.ok) throw new Error('Failed to load index')
                const indexData = await indexRes.json()

                const articleMeta = indexData.articles.find((a: Article) => a.slug === slug)

                if (!articleMeta) {
                    throw new Error('Article not found in index')
                }

                setMeta(articleMeta)

                // Construct filename: YYYY-MM-DD-slug.md
                const filename = `${articleMeta.date}-${articleMeta.slug}.md`
                const articleRes = await fetch(`/json_data/articles/${filename}`)

                if (!articleRes.ok) {
                    throw new Error('Failed to load article content')
                }

                const text = await articleRes.text()
                // Remove frontmatter for display (regex to remove --- ... ---)
                const contentBody = text.replace(/^---[\s\S]*?---\s*/, '')

                setContent(contentBody)
                setLoading(false)

            } catch (err) {
                console.error('Error loading article:', err)
                setError(err instanceof Error ? err.message : 'Article not found')
                setLoading(false)
            }
        }

        fetchArticle()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)]">

                <div className="content-width py-12 flex justify-center">
                    <div className="text-xl text-[var(--text-secondary)]">Loading article...</div>
                </div>
            </div>
        )
    }

    if (error || !meta) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)]">

                <div className="content-width py-12">
                    <div className="bg-[var(--bg-secondary)] p-8 rounded-xl border border-[var(--border-color)] text-center">
                        <div className="text-xl text-red-400 mb-4">Unable to load article</div>
                        <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                        <Link href="/news" className="text-[var(--accent-primary)] hover:underline">
                            ← Return to News Feed
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">

            <main className="content-width py-8">
                {/* Back Link */}
                <Link
                    href="/news"
                    className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] mb-6 transition-colors"
                >
                    <IconChevronLeft size={16} className="mr-1" />
                    Back to News Feed
                </Link>

                <article className="max-w-3xl mx-auto">
                    {/* Article Header */}
                    <header className="mb-8 border-b border-[var(--border-color)] pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] uppercase tracking-wide">
                                {meta.category}
                            </span>
                            <span className="text-sm text-[var(--text-secondary)]">
                                {new Date(meta.date!).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-6">
                            {meta.title}
                        </h1>

                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <span>Sources:</span>
                            {meta.sources?.map((source, i) => (
                                <span key={source} className="font-medium text-[var(--text-primary)]">
                                    {source}{i < meta.sources!.length - 1 ? ',' : ''}
                                </span>
                            ))}
                        </div>
                    </header>

                    {/* Article Body */}
                    <div className="prose prose-invert md:prose-lg max-w-none 
                        prose-headings:text-[var(--text-primary)] prose-headings:mb-4 prose-headings:mt-8
                        prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-[var(--accent-primary)] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--text-primary)]
                        prose-li:text-[var(--text-secondary)] prose-li:mb-2
                        prose-ul:my-6 prose-ol:my-6
                        prose-blockquote:border-l-4 prose-blockquote:border-[var(--accent-primary)] prose-blockquote:bg-[var(--bg-secondary)] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-blockquote:my-6
                        prose-hr:border-[var(--border-color)] prose-hr:my-8
                    ">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </article>
            </main>
        </div>
    )
}
