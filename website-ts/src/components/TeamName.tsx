'use client'

import { getTeamColor } from '@/utils/teamColors'

interface TeamNameProps {
    team: string | null | undefined
    className?: string
    fallback?: string
}

/**
 * Displays a team name/abbreviation with the team's official color
 */
export default function TeamName({ team, className = '', fallback = '-' }: TeamNameProps) {
    if (!team) {
        return <span className={className}>{fallback}</span>
    }

    const color = getTeamColor(team)

    return (
        <span
            className={`font-semibold ${className}`}
            style={color ? { color } : undefined}
        >
            {team}
        </span>
    )
}
