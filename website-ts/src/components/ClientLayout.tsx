'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { IconMenu, IconFootball, IconHome, IconAnalytics, IconDocument } from '@/components/Icons'

interface ClientLayoutProps {
    children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    // Set mounted to true after hydration
    useEffect(() => {
        setMounted(true)
    }, [])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (mounted && typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarCollapsed(true)
        }
    }, [pathname, mounted])

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !sidebarCollapsed) {
                setSidebarCollapsed(true)
            }
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [sidebarCollapsed])

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev)
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col">
                {/* Header - compact on mobile to save vertical space */}
                <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)] shadow-sm">
                    <div className="flex items-center justify-between h-11 md:h-14 px-3 md:px-4">
                        {/* Left: Logo */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {/* Logo - smaller on mobile */}
                                <div className="relative w-7 h-7 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
                                    <Image
                                        src="/Logo.png"
                                        alt="Logo"
                                        width={32}
                                        height={32}
                                        className="w-7 h-7 md:w-8 md:h-8 object-contain"
                                    />
                                </div>

                                <span className="text-base md:text-lg font-bold text-[var(--text-primary)] hidden sm:inline">
                                    GreenEighteen Sports
                                </span>
                                <span className="text-base md:text-lg font-bold text-[var(--text-primary)] sm:hidden">
                                    G18
                                </span>
                            </Link>
                        </div>

                        {/* Right: Theme Toggle */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Navigation Bar - Only visible on mobile */}
                    <nav className="md:hidden border-t border-[var(--border-color)] bg-[var(--header-bg)]">
                        <div className="flex items-center justify-around px-2 py-2">
                            <Link
                                href="/"
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 ${pathname === '/'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <IconHome size={18} className="flex-shrink-0" />
                                <span className="text-xs font-medium truncate">Home</span>
                            </Link>
                            <Link
                                href="/fantasy-football"
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 ${pathname === '/fantasy-football'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <IconAnalytics size={18} className="flex-shrink-0" />
                                <span className="text-xs font-medium truncate">Fantasy</span>
                            </Link>
                            <Link
                                href="/news"
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 ${pathname === '/news'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <IconDocument size={18} className="flex-shrink-0" />
                                <span className="text-xs font-medium truncate">News</span>
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Main Layout */}
                <div className="flex flex-1 relative">
                    {/* Sidebar - hidden on mobile, only visible on desktop */}
                    <div className="hidden md:block">
                        {mounted && (
                            <Sidebar
                                collapsed={sidebarCollapsed}
                                onToggle={toggleSidebar}
                            />
                        )}
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden max-w-full pt-11 md:pt-0">
                        {children}
                    </main>
                </div>

                {/* Footer - compact on mobile */}
                <footer className="border-t border-[var(--border-color)] py-3 md:py-4 px-3 md:px-4 bg-[var(--bg-secondary)]">
                    <div className="content-width">
                        <p className="text-center text-xs text-[var(--text-muted)]">
                            Data provided by{' '}
                            <a
                                href="https://nflverse.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent-primary)] hover:underline"
                            >
                                NFLVerse
                            </a>
                            . This site is not affiliated with the NFL.
                        </p>
                    </div>
                </footer>
            </div>
        </ThemeProvider>
    )
}

