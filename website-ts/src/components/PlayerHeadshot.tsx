'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getHeadshotPath } from '@/utils/dataLoader'
import { IconDevProfile } from '@/components/Icons'

interface PlayerHeadshotProps {
    playerName: string
    position: string
    size?: number
    className?: string
    priority?: boolean
}

export default function PlayerHeadshot({
    playerName,
    position,
    size = 64,
    className = '',
    priority = false,
}: PlayerHeadshotProps) {
    const [hasError, setHasError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const headshotPath = getHeadshotPath(playerName, position)

    return (
        <div
            className={`relative overflow-hidden rounded-full bg-[var(--bg-secondary)] ${className}`}
            style={{ width: size, height: size }}
        >
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 skeleton" />
            )}

            {!hasError && (
                <Image
                    src={headshotPath}
                    alt={`${playerName} headshot`}
                    width={size}
                    height={size}
                    className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onError={() => setHasError(true)}
                    onLoad={() => setIsLoaded(true)}
                    loading={priority ? 'eager' : 'lazy'}
                    unoptimized
                />
            )}

            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                    <IconDevProfile size={size * 0.6} />
                </div>
            )}
        </div>
    )
}
