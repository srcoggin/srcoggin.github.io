'use client'

import { useState, useEffect } from 'react'
import { IconPalette, IconChevronDown } from '@/components/Icons'

type ThemeName = 'dark' | 'light' | 'ocean' | 'amber' | 'forest'

interface ThemeOption {
    name: ThemeName
    label: string
    preview: string // CSS color for preview dot
}

const themes: ThemeOption[] = [
    { name: 'dark', label: 'Dark', preview: '#0f1419' },
    { name: 'light', label: 'Light', preview: '#ffffff' },
    { name: 'ocean', label: 'Ocean', preview: '#0c1929' },
    { name: 'amber', label: 'Amber', preview: '#1c1917' },
    { name: 'forest', label: 'Forest', preview: '#0d1f0d' },
]

export default function ThemeToggle() {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('dark')
    const [isOpen, setIsOpen] = useState(false)

    // Load theme from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme') as ThemeName | null
        if (saved && themes.find((t) => t.name === saved)) {
            setCurrentTheme(saved)
            document.documentElement.setAttribute('data-theme', saved)
        }
    }, [])

    const handleThemeChange = (theme: ThemeName) => {
        setCurrentTheme(theme)
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
        setIsOpen(false)
    }

    const currentLabel = themes.find((t) => t.name === currentTheme)?.label || 'Dark'

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                aria-label="Toggle theme"
                aria-expanded={isOpen}
            >
                <IconPalette size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline">{currentLabel}</span>
                <IconChevronDown
                    size={16}
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg z-50 overflow-hidden">
                        {themes.map((theme) => (
                            <button
                                key={theme.name}
                                type="button"
                                onClick={() => handleThemeChange(theme.name)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-150
                  ${currentTheme === theme.name
                                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    }
                `}
                            >
                                <span
                                    className="w-4 h-4 rounded-full border border-[var(--border-color)] flex-shrink-0"
                                    style={{ backgroundColor: theme.preview }}
                                />
                                <span className="font-medium">{theme.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
