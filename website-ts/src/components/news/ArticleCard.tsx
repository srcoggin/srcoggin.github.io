import Link from 'next/link'
import { Article } from '@/types'

interface ArticleCardProps {
    article: Article
    featured?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
    'trades': 'Trades',
    'coaching': 'Coaching',
    'injuries': 'Injuries',
    'free-agency': 'Free Agency',
    'draft': 'Draft',
    'superbowl': 'Super Bowl',
    'player-news': 'Player News',
    'team-news': 'Team News',
    'general': 'NFL News'
}

const CATEGORY_COLORS: Record<string, string> = {
    'trades': 'text-orange-400 bg-orange-400/10',
    'coaching': 'text-blue-400 bg-blue-400/10',
    'injuries': 'text-red-400 bg-red-400/10',
    'free-agency': 'text-green-400 bg-green-400/10',
    'draft': 'text-purple-400 bg-purple-400/10',
    'superbowl': 'text-yellow-400 bg-yellow-400/10',
    'general': 'text-gray-400 bg-gray-400/10'
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
    const categoryLabel = CATEGORY_LABELS[article.category] || article.category
    const categoryColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS['general']

    return (
        <Link
            href={`/news/${article.slug}`}
            className={`
                group block relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] 
                transition-all duration-300 hover:border-[var(--accent-primary)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/10
                active:scale-[0.98] touch-manipulation
                ${featured ? 'col-span-full md:col-span-2 lg:col-span-3' : 'col-span-1'}
            `}
        >
            <div className={`p-4 sm:p-5 ${featured ? 'md:p-8 flex flex-col justify-center h-full' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColor}`}>
                        {categoryLabel}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                        {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {/* Source pill */}
                    {article.sources.length > 0 && (
                        <span className="hidden sm:inline-block text-xs text-[var(--text-secondary)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
                            {article.sources[0]}
                        </span>
                    )}
                </div>

                <h3 className={`
                    font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors line-clamp-3
                    ${featured ? 'text-2xl md:text-4xl leading-tight' : 'text-lg leading-snug'}
                `}>
                    {article.title}
                </h3>

                {/* Summary/Blurb */}
                {article.summary && (
                    <p className={`
                        text-[var(--text-secondary)] leading-relaxed
                        ${featured ? 'text-base md:text-lg line-clamp-3 mb-4' : 'text-sm line-clamp-2'}
                    `}>
                        {article.summary}
                    </p>
                )}
            </div>
        </Link>
    )
}
