export type Theme = 'dark' | 'light' | 'ocean' | 'amber' | 'forest'

export const DEFAULT_THEME: Theme = 'dark'

export const THEMES: Theme[] = ['dark', 'light', 'ocean', 'amber', 'forest']

export function isValidTheme(value: unknown): value is Theme {
    return typeof value === 'string' && THEMES.includes(value as Theme)
}

export const THEME_LABELS: Record<Theme, string> = {
    dark: 'Dark',
    light: 'Light',
    ocean: 'Ocean',
    amber: 'Amber',
    forest: 'Forest',
}

interface ChartColors {
    grid: string
    text: string
    textSecondary: string
    bg: string
    border: string
    dot: string
}

export const CHART_COLORS: Record<Theme, ChartColors> = {
    dark: {
        grid: '#384250',
        text: '#e7e9ea',
        textSecondary: '#8b98a5',
        bg: '#252b33',
        border: '#384250',
        dot: '#e31937',
    },
    light: {
        grid: '#dadce0',
        text: '#1a1a1a',
        textSecondary: '#5f6368',
        bg: '#ffffff',
        border: '#dadce0',
        dot: '#c41030',
    },
    ocean: {
        grid: '#2d5a87',
        text: '#e6f2ff',
        textSecondary: '#7eb8da',
        bg: '#1a3a5c',
        border: '#2d5a87',
        dot: '#4fc3f7',
    },
    amber: {
        grid: '#78716c',
        text: '#fef3c7',
        textSecondary: '#d6d3d1',
        bg: '#44403c',
        border: '#78716c',
        dot: '#f59e0b',
    },
    forest: {
        grid: '#3d5c3d',
        text: '#dcfce7',
        textSecondary: '#86efac',
        bg: '#243d24',
        border: '#3d5c3d',
        dot: '#22c55e',
    },
}
