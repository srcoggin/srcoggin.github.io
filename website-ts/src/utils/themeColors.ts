/**
 * Theme IDs and display config for the theme selector.
 * Actual colour values live in globals.css via CSS variables per [data-theme].
 */

export type Theme = 'dark' | 'light' | 'ocean' | 'amber' | 'forest'

export const THEMES: { id: Theme; label: string; swatch: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', swatch: '#0e1117', icon: '🌙' },
  { id: 'light', label: 'Light', swatch: '#ffffff', icon: '☀️' },
  { id: 'ocean', label: 'Ocean', swatch: '#0c1929', icon: '🌊' },
  { id: 'amber', label: 'Amber', swatch: '#292524', icon: '🟤' },
  { id: 'forest', label: 'Forest', swatch: '#0d1f0d', icon: '🌲' },
]

export const DEFAULT_THEME: Theme = 'dark'

export function isValidTheme(value: string): value is Theme {
  return THEMES.some((t) => t.id === value)
}

/** Chart/Recharts colors per theme (for components that need resolved values) */
export const CHART_COLORS: Record<
  Theme,
  { text: string; textSecondary: string; grid: string; bg: string; border: string; dot: string }
> = {
  dark: {
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    grid: '#30363d',
    bg: '#21262d',
    border: '#30363d',
    dot: '#58a6ff',
  },
  light: {
    text: '#1f2328',
    textSecondary: '#57606a',
    grid: '#d0d7de',
    bg: '#ffffff',
    border: '#d0d7de',
    dot: '#0969da',
  },
  ocean: {
    text: '#e6f2ff',
    textSecondary: '#7eb8da',
    grid: '#2d5a87',
    bg: '#1a3a5c',
    border: '#2d5a87',
    dot: '#4fc3f7',
  },
  amber: {
    text: '#fef3c7',
    textSecondary: '#d6d3d1',
    grid: '#78716c',
    bg: '#44403c',
    border: '#78716c',
    dot: '#f59e0b',
  },
  forest: {
    text: '#dcfce7',
    textSecondary: '#86efac',
    grid: '#3d5c3d',
    bg: '#243d24',
    border: '#3d5c3d',
    dot: '#22c55e',
  },
}
