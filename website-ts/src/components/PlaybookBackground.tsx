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
}

const DESKTOP_SLOT_COUNT = 18
const MOBILE_SLOT_COUNT = 6
const MOBILE_ACTIVE_MIN = 3
const MOBILE_ACTIVE_MAX = 5
const DESKTOP_ACTIVE_MIN = 12
const DESKTOP_ACTIVE_MAX = 16

export default function PlaybookBackground() {
    const [routes, setRoutes] = useState<Route[]>([])
    const [isMobile, setIsMobile] = useState(false)
    const [hasMeasured, setHasMeasured] = useState(false)

    // Detect mobile viewport
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
    const safeX = useCallback((val: number) => Math.min(Math.max(val, 3), 97), [])
    const safeY = useCallback((val: number) => Math.min(Math.max(val, 3), 94), [])

    // --- CREATE ROUTE ---
    const createRoute = useCallback((slotIndex: number, neighbors: (number | undefined)[], initialDelay: boolean, slotCount: number): Route => {
        const slotWidth = 100 / slotCount
        const slotBase = (slotIndex * slotWidth) + (slotWidth / 2)
        const jitter = random(-slotWidth * 0.35, slotWidth * 0.35)
        const startX = safeX(slotBase + jitter)

        const isLeft = startX < 50
        const breakIn = Math.random() < 0.65
        const direction = isLeft ? (breakIn ? 1 : -1) : (breakIn ? -1 : 1)

        let d = `M ${startX},95`

        // Select Type: Ensure it isn't in neighbors
        let type = randomInt(0, 10)
        let attempts = 0
        while (neighbors.includes(type) && attempts < 10) {
            type = randomInt(0, 10)
            attempts++
        }

        // --- GEOMETRY GENERATION ---
        let stemEnd = 0
        switch (type) {
            case 0: // Go (Deep streak)
                stemEnd = random(8, 18);
                d += ` L ${startX},${stemEnd}`;
                break
            case 1: // Hitch (Short comeback)
                stemEnd = random(58, 72);
                d += ` L ${startX},${stemEnd}`;
                const hitchX = safeX(startX + (direction * 2.5));
                const hitchY = stemEnd + random(3, 6);
                d += ` L ${hitchX},${hitchY}`;
                break
            case 2: // Out (Sharp horizontal)
                stemEnd = random(40, 65);
                d += ` L ${startX},${stemEnd}`;
                const outX = safeX(startX + (direction * random(18, 28)));
                d += ` L ${outX},${stemEnd}`;
                break
            case 3: // Post (Diagonal deep)
                stemEnd = random(30, 50);
                d += ` L ${startX},${stemEnd}`;
                const postX = safeX(startX + (direction * 25));
                const postY = safeY(stemEnd - 25);
                d += ` L ${postX},${postY}`;
                break
            case 4: // Slant (Quick diagonal)
                stemEnd = random(70, 85);
                d += ` L ${startX},${stemEnd}`;
                const slantX = safeX(startX + (direction * 15));
                const slantY = safeY(stemEnd - 12);
                d += ` L ${slantX},${slantY}`;
                break
            case 5: // Chair (L-shape deep)
                stemEnd = random(48, 68);
                d += ` L ${startX},${stemEnd}`;
                const chairX = safeX(startX + direction * 10);
                d += ` L ${chairX},${stemEnd}`;
                const chairY = random(8, 28);
                d += ` L ${chairX},${chairY}`;
                break
            case 6: // Cross (Deep diagonal)
                stemEnd = random(38, 58);
                d += ` L ${startX},${stemEnd}`;
                const crossX = safeX(startX + direction * 45);
                const crossY = safeY(stemEnd - 25);
                d += ` L ${crossX},${crossY}`;
                break
            case 7: // Corner (Curved L)
                stemEnd = random(38, 55);
                d = `M ${startX},95 L ${startX},${stemEnd}`;
                const cornerX = safeX(startX + direction * 18);
                const cornerY = safeY(stemEnd - 22);
                d += ` Q ${startX},${stemEnd - 12} ${cornerX},${cornerY}`;
                break;
            case 8: // Wheel (Curved out and up)
                stemEnd = random(62, 78);
                d = `M ${startX},95 L ${startX},${stemEnd}`;
                const wheelOutX = safeX(startX + direction * 12);
                d += ` Q ${startX},${stemEnd} ${wheelOutX},${stemEnd}`;
                const wheelEndY = random(12, 28);
                d += ` Q ${wheelOutX + (direction * 3)},${stemEnd} ${wheelOutX},${wheelEndY}`;
                break;
            case 9: // Dig (In route)
                stemEnd = random(42, 60);
                d += ` L ${startX},${stemEnd}`;
                const digX = safeX(startX - (direction * random(15, 25)));
                d += ` L ${digX},${stemEnd}`;
                break;
        }

        return {
            id: routeIdCounter++,
            path: d,
            delay: initialDelay ? `${random(0, 6)}s` : `${random(1.5, 4.5)}s`,
            duration: `${random(8, 14)}s`,
            type,
            slotIndex
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
    if (isMobile) return null

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Gradient for the runner */}
                    <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="0.6" />
                        <stop offset="60%" stopColor="var(--accent-primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {routes.map((route) => (
                    <g key={route.id}>
                        <defs>
                            {/* Mask for revealing the trail */}
                            <mask id={`mask-${route.id}`}>
                                <path
                                    d={route.path}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="playbook-mask-anim"
                                    style={{
                                        animationDelay: route.delay,
                                        animationDuration: route.duration
                                    }}
                                />
                            </mask>

                            {/* Path definition for animateMotion */}
                            <path id={`route-path-${route.id}`} d={route.path} />
                        </defs>

                        {/* 1. DOTTED TRAIL (Revealed by mask, lingers longer) */}
                        <path
                            d={route.path}
                            fill="none"
                            stroke="var(--text-secondary)"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="1.2 2.8"
                            mask={`url(#mask-${route.id})`}
                            className="playbook-trail-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                        />

                        {/* 2. ANIMATED RUNNER (Drawing effect) */}
                        <path
                            d={route.path}
                            fill="none"
                            stroke="url(#routeGradient)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="playbook-runner-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                            onAnimationEnd={() => handleAnimationEnd(route.id)}
                        />

                        {/* 3. START NODE (Small circle at route origin) */}
                        <circle
                            cx={route.path.split(' ')[1].split(',')[0]}
                            cy="95"
                            r="0.6"
                            fill="var(--text-secondary)"
                            className="playbook-node-anim"
                            style={{
                                animationDelay: route.delay,
                                animationDuration: route.duration
                            }}
                        />
                    </g>
                ))}
            </svg>

            <style jsx>{`
                /* RUNNER: Animated line drawing */
                .playbook-runner-anim {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation-name: runnerDraw;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                
                /* TRAIL: Dotted line that appears and lingers */
                .playbook-trail-anim {
                    animation-name: trailFade;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }

                /* MASK: Reveals the trail as route draws */
                .playbook-mask-anim {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation-name: maskDraw;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                }

                /* NODE: Start circle */
                .playbook-node-anim {
                    animation-name: nodeFade;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                
                @keyframes runnerDraw {
                    0% { 
                        stroke-dashoffset: 100; 
                        opacity: 0; 
                    }
                    2% { 
                        opacity: 1; 
                    }
                    45% { 
                        stroke-dashoffset: 0; 
                        opacity: 1; 
                    }
                    55% { 
                        stroke-dashoffset: 0;
                        opacity: 1; 
                    }
                    65% { 
                        stroke-dashoffset: 0;
                        opacity: 0; 
                    }
                    100% { 
                        stroke-dashoffset: 0;
                        opacity: 0; 
                    }
                }

                @keyframes maskDraw {
                    0% { 
                        stroke-dashoffset: 100; 
                    }
                    45% { 
                        stroke-dashoffset: 0; 
                    }
                    100% { 
                        stroke-dashoffset: 0; 
                    }
                }

                @keyframes trailFade {
                    0% { 
                        opacity: 0; 
                    }
                    2% { 
                        opacity: 0.5; 
                    }
                    88% { 
                        opacity: 0.5; 
                    }
                    100% { 
                        opacity: 0; 
                    }
                }

                @keyframes nodeFade {
                    0% { 
                        opacity: 0; 
                    }
                    8% { 
                        opacity: 0.5; 
                    }
                    88% { 
                        opacity: 0.5; 
                    }
                    100% { 
                        opacity: 0; 
                    }
                }
            `}</style>
        </div>
    )
}
