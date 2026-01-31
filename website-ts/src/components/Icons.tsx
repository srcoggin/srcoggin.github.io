'use client'

/**
 * Custom SVG icons (replacing emojis) – theme-aware via currentColor where used.
 * All icons use viewBox="0 0 24 24" and accept className and optional size.
 */

interface IconProps {
  className?: string
  size?: number
}

const defaultSize = 24

/** Analytics/chart icon – used for Fantasy Football / “analyze” context (replaces football icon). */
export function IconAnalytics({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 3v18h18" stroke="currentColor" />
      <path d="M7 16v-5" stroke="currentColor" />
      <path d="M12 16v-9" stroke="currentColor" />
      <path d="M17 16V8" stroke="var(--accent-primary)" />
    </svg>
  )
}

export function IconLiveUpdates({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" fill="transparent" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" />
      <circle cx="18" cy="5" r="3" fill="var(--accent-primary)" stroke="none" />
    </svg>
  )
}

export function IconLaunch({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2L10 8h4L12 2z" stroke="currentColor" />
      <path d="M12 8v10" stroke="currentColor" />
      <path d="M8 18l-2 4" stroke="currentColor" />
      <path d="M16 18l2 4" stroke="currentColor" />
      <path d="M9 18h6" stroke="currentColor" />
      <path d="M12 18v4" stroke="var(--accent-primary)" />
      <path d="M10 21l2 1 2-1" stroke="var(--accent-primary)" />
    </svg>
  )
}

export function IconCalendar({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSidebarNav({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <rect x="3" y="3" width="7" height="18" fill="currentColor" fillOpacity={0.1} stroke="currentColor" />
      <line x1="14" y1="8" x2="18" y2="8" stroke="currentColor" />
      <line x1="14" y1="12" x2="18" y2="12" stroke="currentColor" />
      <path d="M6.5 12l-2 0" stroke="var(--accent-primary)" strokeWidth="2" />
      <polyline points="5.5 10 3.5 12 5.5 14" stroke="var(--accent-primary)" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function IconDevProfile({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" fill="transparent" />
      <path d="M17 4l3 2-3 2" stroke="var(--accent-primary)" strokeWidth="2" />
      <path d="M7 4l-3 2 3 2" stroke="var(--accent-primary)" strokeWidth="2" />
    </svg>
  )
}

/* Additional icons for tabs (same stroke style, no emoji) */
export function IconHome({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" />
      <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" />
    </svg>
  )
}

export function IconRookie({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8" stroke="currentColor" fill="transparent" />
    </svg>
  )
}

export function IconRadar({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2v4" stroke="currentColor" />
      <path d="M12 18v4" stroke="currentColor" />
      <path d="M4.93 4.93l2.83 2.83" stroke="currentColor" />
      <path d="M16.24 16.24l2.83 2.83" stroke="currentColor" />
      <path d="M2 12h4" stroke="currentColor" />
      <path d="M18 12h4" stroke="currentColor" />
      <path d="M4.93 19.07l2.83-2.83" stroke="currentColor" />
      <path d="M16.24 7.76l2.83-2.83" stroke="currentColor" />
      <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="var(--accent-primary)" fill="transparent" />
    </svg>
  )
}

export function IconDeepDive({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="8" stroke="currentColor" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" />
    </svg>
  )
}

export function IconDoc({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" />
      <polyline points="10 9 9 9 8 9" stroke="currentColor" />
    </svg>
  )
}

export function IconBook({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" />
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" />
    </svg>
  )
}

export function IconStar({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8" stroke="currentColor" fill="transparent" />
    </svg>
  )
}

export function IconWarning({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" />
    </svg>
  )
}

export function IconTarget({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" />
    </svg>
  )
}

export function IconList({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" />
      <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" />
      <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" />
      <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" />
      <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" />
      <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" />
    </svg>
  )
}

export function IconSleep({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12.16A9 9 0 1 0 11.84 21 7 7 0 0 1 21 12.16z" stroke="currentColor" />
      <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrendUp({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" />
      <polyline points="17 6 23 6 23 12" stroke="currentColor" />
    </svg>
  )
}

export function IconTrendDown({ className = '', size = defaultSize }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" stroke="currentColor" />
      <polyline points="17 18 23 18 23 12" stroke="currentColor" />
    </svg>
  )
}
