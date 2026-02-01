import { useState, useMemo } from 'react'
import Tabs from '../Tabs'
import ArticleCard from './ArticleCard'
import { useNews } from '@/hooks/useNews'
import { IconHome, IconPlayer, IconTeam, IconRookie } from '../Icons'
import { Article } from '@/types'

// Custom Raven icon for "The Expert"
const IconRaven = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
)

export default function NewsFeed() {
    const { articles, loading, error, getArticlesByTab } = useNews()
    const [activeTab, setActiveTab] = useState('hub')

    // Sources listing for the header area (similar to Fantasy Hub)
    const sources = [
        { name: 'ESPN NFL', url: 'https://espn.com/nfl' },
        { name: 'Yahoo Sports', url: 'https://sports.yahoo.com/nfl' },
        { name: 'CBS Sports', url: 'https://cbssports.com/nfl' },
        { name: 'Pro Football Talk', url: 'https://profootballtalk.nbcsports.com' },
        { name: 'Gemini AI', url: 'https://deepmind.google/technologies/gemini/' },
    ]

    const renderTabContent = (tabKey: string) => {
        const tabArticles = getArticlesByTab(tabKey)

        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-[var(--text-secondary)]">Loading news...</div>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-red-500">{error}</div>
                </div>
            )
        }

        if (tabArticles.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-xl text-[var(--text-secondary)] mb-2">No articles found</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Try refreshing or check back later for more news.
                    </p>
                </div>
            )
        }

        // Layout: Featured Article (first one) + Grid of others
        const featuredArticle = tabArticles[0]
        const otherArticles = tabArticles.slice(1, 6) // Next 5 articles as requested

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Featured Article */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ArticleCard article={featuredArticle} featured={true} />
                </div>

                {/* Sub-headline/Divider */}
                {otherArticles.length > 0 && (
                    <>
                        <div className="flex items-center gap-4 my-8">
                            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                            <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                                Latest Headlines
                            </span>
                            <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                        </div>

                        {/* Recent Articles Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherArticles.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        )
    }

    const tabs = [
        {
            id: 'hub',
            label: <><IconHome size={18} className="flex-shrink-0" /> News Hub</>,
            content: renderTabContent('hub')
        },
        {
            id: 'players',
            label: <><IconPlayer size={18} className="flex-shrink-0" /> Players</>,
            content: renderTabContent('players')
        },
        {
            id: 'teams',
            label: <><IconTeam size={18} className="flex-shrink-0" /> Teams</>,
            content: renderTabContent('teams')
        },
        {
            id: 'rookie',
            label: <><IconRookie size={18} className="flex-shrink-0" /> Rookies</>,
            content: renderTabContent('draft')
        },
        {
            id: 'expert',
            label: <><IconRaven size={18} className="flex-shrink-0 text-purple-400" /> The Expert</>,
            content: renderTabContent('expert')
        }
    ]

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">

            <main className="content-width py-6 sm:py-8 flex-1">
                <p className="section-label">LIVE FEED</p>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                    <h1 className="page-title break-words">NFL News Wire</h1>

                    {/* Source Attribution (Fantasy Hub style) */}
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-[var(--text-secondary)] mb-1">AGGREGATED FROM</p>
                        <div className="flex gap-2 justify-end">
                            {sources.map((s, i) => (
                                <span key={s.name} className="contents">
                                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[var(--accent-primary)] hover:underline">
                                        {s.name}
                                    </a>
                                    {i < sources.length - 1 && <span className="text-[var(--text-secondary)]">•</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-2xl">
                    Real-time NFL coverage powered by AI. Curated summaries from top sources, filtered for what matters.
                </p>

                <Tabs tabs={tabs} defaultTab="hub" />
            </main>
        </div>
    )
}
