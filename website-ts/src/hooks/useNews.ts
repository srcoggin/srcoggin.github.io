import { useState, useEffect } from 'react'
import { Article, ArticlesIndex } from '../types'

export function useNews() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch('/json_data/articles_index.json')
                if (!response.ok) {
                    throw new Error('Failed to fetch news index')
                }
                const data: ArticlesIndex = await response.json()

                // Filter only AI generated articles as per requirement
                // And sort by date descending (though index is already sorted)
                const aiArticles = data.articles.filter(a => a.aiGenerated)

                setArticles(aiArticles)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching news:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    // Helper to get articles by tab
    const getArticlesByTab = (tab: string) => {
        switch (tab) {
            case 'players':
                return articles.filter(a =>
                    ['injuries', 'trades', 'free-agency', 'player-news'].includes(a.category)
                )
            case 'teams':
                return articles.filter(a =>
                    ['team-news', 'coaching', 'trades'].includes(a.category)
                )
            case 'draft':
                return articles.filter(a =>
                    ['draft'].includes(a.category)
                )
            case 'general':
                // General tab - articles that don't fit other specific categories
                return articles.filter(a =>
                    ['general', 'superbowl'].includes(a.category) ||
                    !['injuries', 'trades', 'free-agency', 'player-news', 'team-news', 'coaching', 'draft'].includes(a.category)
                )
            case 'expert':
                // "The Expert" tab - Baltimore Ravens news
                // Check tags, title, or category
                return articles.filter(a => {
                    const searchStr = (a.title + ' ' + (a.slug || '')).toLowerCase()
                    return searchStr.includes('ravens') || searchStr.includes('baltimore')
                })
            case 'hub':
            default:
                // News Hub shows everything
                return articles
        }
    }

    return {
        articles,
        loading,
        error,
        getArticlesByTab
    }
}
