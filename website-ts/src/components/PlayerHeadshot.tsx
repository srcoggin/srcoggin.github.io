'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getHeadshotPath, didHeadshotFail, getFallbackHeadshot } from '@/utils/dataLoader'
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
    const [isInView, setIsInView] = useState(priority)
    const imgRef = useRef<HTMLDivElement>(null)

    const headshotPath = getHeadshotPath(playerName, position)

    // Check if already known to have failed
    useEffect(() => {
        if (didHeadshotFail(headshotPath)) {
            setHasError(true)
        }
    }, [headshotPath])

    // Intersection observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before in view
            }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => observer.disconnect()
    }, [priority, isInView])

    const handleError = () => {
        setHasError(true)
    }

    const handleLoad = () => {
        setIsLoaded(true)
    }

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden rounded-full bg-[var(--bg-secondary)] ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Skeleton loading state */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 skeleton" />
            )}

            {/* Actual image - only render when in view */}
            {isInView && !hasError && (
                <Image
                    src={headshotPath}
                    alt={`${playerName} headshot`}
                    width={size}
                    height={size}
                    className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onError={handleError}
                    onLoad={handleLoad}
                    loading={priority ? 'eager' : 'lazy'}
                    unoptimized
                />
            )}

            {/* Fallback icon on error */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                    <IconDevProfile size={size * 0.6} />
                </div>
            )}
        </div>
    )
}
