'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { IconMenu, IconFootball } from '@/components/Icons'

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
                {/* Header */}
                <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)] shadow-sm">
                    <div className="flex items-center justify-between h-14 px-4">
                        {/* Left: Menu button + Logo */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] md:hidden"
                                aria-label={sidebarCollapsed ? 'Open menu' : 'Close menu'}
                            >
                                <IconMenu size={22} />
                            </button>

                            <Link
                                href="/"
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {/* Logo */}
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[var(--accent-primary)] flex items-center justify-center">
                                    <Image
                                        src="/Logo.png"
                                        alt="Logo"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                        priority
                                        unoptimized
                                        onError={(e) => {
                                            // Fallback to icon if logo fails to load
                                            (e.target as HTMLImageElement).style.display = 'none'
                                        }}
                                    />
                                    <IconFootball size={18} className="absolute text-white opacity-0" />
                                </div>

                                <span className="text-lg font-bold text-[var(--text-primary)] hidden sm:inline">
                                    The Expert Football
                                </span>
                                <span className="text-lg font-bold text-[var(--text-primary)] sm:hidden">
                                    TEF
                                </span>
                            </Link>
                        </div>

                        {/* Right: Theme Toggle */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Main Layout */}
                <div className="flex flex-1 relative">
                    {/* Sidebar - only render after mounted to prevent hydration mismatch */}
                    {mounted && (
                        <Sidebar
                            collapsed={sidebarCollapsed}
                            onToggle={toggleSidebar}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 flex flex-col">
                        {children}
                    </main>
                </div>

                {/* Footer */}
                <footer className="border-t border-[var(--border-color)] py-4 px-4 bg-[var(--bg-secondary)]">
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

