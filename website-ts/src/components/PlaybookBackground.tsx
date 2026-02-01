'use client'

import { useEffect, useState, useCallback } from 'react'

// Unique ID counter
let routeIdCounter = 0

interface Route {
    id: number
    path: string
    delay: string
    duration: string
    type: number
    slotIndex: number
    endX: number
    endY: number
    angle: number
}

const DESKTOP_SLOT_COUNT = 15
const MOBILE_SLOT_COUNT = 5
const MOBILE_ACTIVE_MIN = 2
const MOBILE_ACTIVE_MAX = 4
const DESKTOP_ACTIVE_MIN = 10
const DESKTOP_ACTIVE_MAX = 13

export default function PlaybookBackground() {
    const [routes, setRoutes] = useState<Route[]>([])
    const [isMobile, setIsMobile] = useState(false)
    const [hasMeasured, setHasMeasured] = useState(false)

    // Detect mobile viewport (after mount to avoid hydration mismatch)
    useEffect(() => {
        const check = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < 768)
                setHasMeasured(true)
            }
        }
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // --- HELPERS ---
    const random = useCallback((min: number, max: number) => Math.random() * (max - min) + min, [])
    const randomInt = useCallback((min: number, max: number) => Math.floor(random(min, max)), [random])
    const safeX = useCallback((val: number) => Math.min(Math.max(val, 2), 98), [])
    const safeY = useCallback((val: number) => Math.min(Math.max(val, 2), 95), [])

    // --- CREATE ROUTE ---
    const createRoute = useCallback((slotIndex: number, neighbors: (number | undefined)[], initialDelay: boolean, slotCount: number): Route => {
        const slotWidth = 100 / slotCount
        // Calculate Base X for this slot
        const slotBase = (slotIndex * slotWidth) + (slotWidth / 2)
        // Jitter: Reduced to prevent overlap (+/- 35% of slot width)
        const jitter = random(-slotWidth * 0.35, slotWidth * 0.35)
        const startX = safeX(slotBase + jitter)

        const isLeft = startX < 50
        const breakIn = Math.random() < 0.65
        const direction = isLeft ? (breakIn ? 1 : -1) : (breakIn ? -1 : 1)

        let d = `M ${startX},95` // Start Line

        // Track end point for arrow calculation
        let endX = startX
        let endY = 95
        let lastAngle = -90 // Default up

        // Select Type: Ensure it isn't in neighbors
        // Reduced max to 8 because we removed Zig (was 9 types 0-8, now 8 types 0-7)
        let type = randomInt(0, 8)
        let attempts = 0
        while (neighbors.includes(type) && attempts < 10) {
            type = randomInt(0, 8)
            attempts++
        }

        // --- GEOMETRY GENERATION ---
        let stemEnd = 0
        switch (type) {
            case 0: // Go (Deep)
                stemEnd = 95;
                // End point estimate
                endX = startX; endY = random(5, 15);
                d += ` L ${endX},${endY}`;
                break
            case 1: // Hitch (Med)
                stemEnd = random(55, 70);
                d += ` L ${startX},${stemEnd}`;
                endX = startX + (direction * 3); endY = stemEnd + random(5, 8);
                d += ` L ${endX},${endY}`;
                break
            case 2: // Out (Med)
                stemEnd = random(35, 60);
                d += ` L ${startX},${stemEnd}`;
                endX = safeX(startX + (direction * random(15, 25))); endY = stemEnd;
                d += ` L ${endX},${endY}`;
                break
            case 3: // Post (Deep)
                stemEnd = random(25, 45);
                d += ` L ${startX},${stemEnd}`;
                endX = safeX(startX + (direction * 20)); endY = safeY(stemEnd - 20);
                d += ` L ${endX},${endY}`;
                break
            // CASE 4 (Zig) REMOVED
            case 4: // Chair (Deep) (Was 5)
                stemEnd = random(45, 65);
                d += ` L ${startX},${stemEnd}`;
                const cx = safeX(startX + direction * 8);
                d += ` L ${cx},${stemEnd}`;
                endX = cx; endY = random(5, 25);
                d += ` L ${endX},${endY}`;
                break
            case 5: // Cross (Deep) (Was 6)
                stemEnd = random(35, 55);
                d += ` L ${startX},${stemEnd}`;
                endX = safeX(startX + direction * 40); endY = safeY(stemEnd - 20);
                d += ` L ${endX},${endY}`;
                break
            case 6: // Corner (Deep - Curved) (Was 7)
                stemEnd = random(35, 50);
                // Quadratic curve for corner
                d = `M ${startX},95 L ${startX},${stemEnd}`;
                d += ` Q ${startX},${stemEnd - 10} ${safeX(startX + direction * 15)},${safeY(stemEnd - 20)}`;
                endX = safeX(startX + direction * 15);
                endY = safeY(stemEnd - 20);
                break;
            case 7: // Wheel (Curved out and up) (Was 8)
                stemEnd = random(60, 75);
                d = `M ${startX},95 L ${startX},${stemEnd}`;
                // Out then up
                const wheelOutX = safeX(startX + direction * 10);
                const wheelOutY = stemEnd;
                // Curve out
                d += ` Q ${startX},${wheelOutY} ${wheelOutX},${wheelOutY}`;
                // Curve up
                const wheelEndY = random(10, 25);
                d += ` Q ${wheelOutX + (direction * 2)},${wheelOutY} ${wheelOutX},${wheelEndY}`;
                endX = wheelOutX;
                endY = wheelEndY;
                break;
        }

        // FASTER TIMING
        return {
            id: routeIdCounter++,
            path: d,
            delay: initialDelay ? `${random(0, 5)}s` : `${random(2, 5)}s`,
            duration: `${random(7, 12)}s`,
            type,
            slotIndex,
            // Arrow props
            endX,
            endY,
            angle: lastAngle
        }
    }, [random, randomInt, safeX, safeY])

    // --- INITIAL MOUNT ---
    useEffect(() => {
        if (!hasMeasured) return
        const slotCount = isMobile ? MOBILE_SLOT_COUNT : DESKTOP_SLOT_COUNT
        const activeMin = isMobile ? MOBILE_ACTIVE_MIN : DESKTOP_ACTIVE_MIN
        const activeMax = isMobile ? MOBILE_ACTIVE_MAX : DESKTOP_ACTIVE_MAX

        const allSlots = Array.from({ length: slotCount }, (_, i) => i)
        for (let i = allSlots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
        }

        const activeCount = Math.min(
            Math.floor(Math.random() * (activeMax - activeMin + 1)) + activeMin,
            slotCount
        )
        const chosenSlots = allSlots.slice(0, activeCount).sort((a, b) => a - b)

        const initialRoutes: Route[] = []
        chosenSlots.forEach((slot) => {
            initialRoutes.push(createRoute(slot, [], true, slotCount))
        })

        setRoutes(initialRoutes)
    }, [createRoute, isMobile, hasMeasured])

    // --- REGENERATE ---
    const slotCount = isMobile ? MOBILE_SLOT_COUNT : DESKTOP_SLOT_COUNT
    const handleAnimationEnd = (endedRouteId: number) => {
        setRoutes(prev => {
            const targetIndex = prev.findIndex(r => r.id === endedRouteId)
            if (targetIndex === -1) return prev

            const oldRoute = prev[targetIndex]
            const neighbors = prev
                .filter(r => Math.abs(r.slotIndex - oldRoute.slotIndex) <= 1 && r.id !== endedRouteId)
                .map(r => r.type)

            const newRoute = createRoute(oldRoute.slotIndex, neighbors, false, slotCount)

            const newRoutes = [...prev]
            newRoutes[targetIndex] = newRoute
            return newRoutes
        })
    }

    if (routes.length === 0) return null

    // Hide runners on mobile - they stretch badly on tall narrow viewports
    if (isMobile) return null

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="routeFadeFast" x1="0%" y1="100%" x2="0%" y2="0%">
                        {/* Start OPAQUE (1) to hide the dots underneath while drawing */}
                        <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="1" />
                        <stop offset="30%" stopColor="var(--text-secondary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {routes.map((route) => (
                    <g key={route.id}>
                        <defs>
                            <mask id={`mask-${route.id}`}>
                                <path
                                    d={route.path}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="playbook-mask-anim"
                                    style={{
                                        animationDelay: route.delay,
                                        animationDuration: route.duration
                                    }}
                                />
                            </mask>
                            {/* Define path for animateMotion to reference */}
                            <path id={`route-path-${route.id}`} d={route.path} />
                        </defs>

                        {/* 1. GHOST TRAIL (Lingers longer, dotted, masked) */}
                        <path
                            d={route.path}
                            fill="none"
                            stroke="var(--text-secondary)"
                            strokeOpacity="1"
                            strokeWidth="0.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="1.5 3.5"
                            mask={`url(#mask-${route.id})`}
                            className="playbook-trail-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                        />

                        {/* 2. RUNNER (Fast, opaque to hide dots, fades early) */}
                        <path
                            d={route.path}
                            fill="none"
                            stroke="url(#routeFadeFast)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="playbook-runner-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                            onAnimationEnd={() => handleAnimationEnd(route.id)}
                        />

                        {/* 3. TIP REMOVED (Clean line end) */}


                        {/* Start Node */}
                        <circle cx={route.path.split(' ')[1].split(',')[0]} cy="95" r="0.8" fill="var(--text-secondary)" className="playbook-node-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                        />
                    </g>
                ))}
            </svg>

            <style jsx>{`
                /* RUNNER: Draws fast, fades out early */
                .playbook-runner-anim {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation-name: runnerAnim;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                
                /* TRAIL: Dotted line, revealed by mask, stays visible longer */
                .playbook-trail-anim {
                    animation-name: trailAnim;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }

                /* MASK: Draws the line to reveal the dotted trail */
                .playbook-mask-anim {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation-name: maskAnim;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                }

                .playbook-node-anim {
                    animation-name: fadeNode;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }

                /* ARROW OPACITY: Syncs with runner */
                .playbook-arrow-fader {
                    animation-name: arrowOpacityAnim;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                
                @keyframes runnerAnim {
                    0% { stroke-dashoffset: 100; opacity: 0; }
                    1% { opacity: 1; } /* Be opaque immediately */
                    40% { stroke-dashoffset: 0; opacity: 1; } /* Finished drawing */
                    50% { opacity: 1; stroke-dashoffset: 0; }
                    60% { opacity: 0; stroke-dashoffset: 0; } /* Fades out */
                    100% { opacity: 0; stroke-dashoffset: 0; }
                }

                @keyframes maskAnim {
                    0% { stroke-dashoffset: 100; }
                    40% { stroke-dashoffset: 0; } /* Matches runner draw time */
                    100% { stroke-dashoffset: 0; }
                }

                @keyframes trailAnim {
                    0% { opacity: 0; }
                    1% { opacity: 0.4; } /* Appears immediately (masked) */
                    85% { opacity: 0.4; } /* Stays visible long after runner fades */
                    100% { opacity: 0; }
                }

                @keyframes arrowOpacityAnim {
                    0% { opacity: 0; }
                    1% { opacity: 1; } /* VISIBLE WHILE MOVING */
                    40% { opacity: 1; } /* Arrives opacity 1 */
                    50% { opacity: 1; }
                    60% { opacity: 0; } /* Fades with runner */
                    100% { opacity: 0; }
                }

                @keyframes fadeNode {
                    0% { opacity: 0; }
                    10% { opacity: 0.4; }
                    85% { opacity: 0.4; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    )
}
