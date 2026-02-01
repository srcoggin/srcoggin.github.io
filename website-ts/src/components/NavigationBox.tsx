'use client'

import Link from 'next/link'
import { IconAnalytics, IconDocument } from '@/components/Icons'

interface NavItem {
    title: string
    description: string
    href: string
    icon: React.ReactNode
    gradient: string
}

const navItems: NavItem[] = [
    {
        title: 'Fantasy Football',
        description: 'Player grades, draft prospects, and fantasy analysis tools. Compare players, explore rookie rankings, and deep dive into stats.',
        href: '/fantasy-football',
        icon: <IconAnalytics size={28} className="flex-shrink-0" />,
        gradient: 'from-emerald-500/20 to-teal-600/20 hover:from-emerald-500/30 hover:to-teal-600/30',
    },
    {
        title: 'NFL News',
        description: 'Real-time NFL coverage powered by AI. Curated summaries from top sports sources, filtered for what matters.',
        href: '/news',
        icon: <IconDocument size={28} className="flex-shrink-0" />,
        gradient: 'from-blue-500/20 to-indigo-600/20 hover:from-blue-500/30 hover:to-indigo-600/30',
    },
]

export default function NavigationBox() {
    return (
        <section className="pb-10 sm:pb-14">
            <p className="section-label flex items-center gap-2 mb-1">
                🚀 Quick Start
            </p>
            <h2 className="section-heading mb-4">Explore the Site</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            group relative overflow-hidden rounded-xl border border-[var(--border-color)] 
                            bg-gradient-to-br ${item.gradient}
                            p-5 md:p-6 transition-all duration-300
                            hover:border-[var(--accent-primary)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/10
                            hover:-translate-y-1
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--accent-primary)] group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        {/* Arrow indicator */}
                        <div className="absolute top-5 right-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-all duration-300 group-hover:translate-x-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
