'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

let routeIdGen = 0

interface AnimatedRoute {
    id: number
    path: string
    delay: number
    startX: number
}

const WAVE_DURATION = 14
const INTER_WAVE_GAP = 4
const MAX_TOTAL_STAGGER = 4
const Y0 = 97

function random(min: number, max: number) { return Math.random() * (max - min) + min }
function randomInt(min: number, max: number) { return Math.floor(random(min, max + 1)) }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function getDepthFactor(height: number): number {
    return clamp(height / 900, 0.7, 1.4)
}

function dY(rawY: number, depth: number): number {
    return clamp(Y0 - (Y0 - rawY) * depth, 3, 95)
}

interface WaveConfig {
    routeMin: number
    routeMax: number
    laneCount: number
    depth: number
}

function getWaveConfig(width: number, height: number): WaveConfig {
    const depth = getDepthFactor(height)
    if (width < 640)  return { routeMin: 3, routeMax: 4,  laneCount: 5,  depth }
    if (width < 1024) return { routeMin: 4, routeMax: 6,  laneCount: 7,  depth }
    if (width < 1440) return { routeMin: 5, routeMax: 8,  laneCount: 9,  depth }
    if (width < 1920) return { routeMin: 7, routeMax: 10, laneCount: 12, depth }
    return                    { routeMin: 10, routeMax: 13, laneCount: 15, depth }
}

function generateLanes(count: number): { center: number; jitter: number }[] {
    const margin = 6
    const usable = 100 - 2 * margin
    const spacing = usable / (count - 1)
    return Array.from({ length: count }, (_, i) => ({
        center: margin + i * spacing,
        jitter: Math.min(spacing * 0.3, 4),
    }))
}

type RouteFn = (x: number, y0: number, inDir: number, depth: number) => string

const outsideRoutes: RouteFn[] = [
    // Go (deep vertical streak)
    (x, y0, _, depth) => {
        const rawEnd = random(5, 15)
        const drift = random(-1.5, 1.5)
        return `M${x},${y0} C${x},${dY(y0 - 25, depth)} ${x + drift},${dY(rawEnd + 20, depth)} ${x + drift},${dY(rawEnd, depth)}`
    },
    // Hitch (short stem, small break back)
    (x, y0, dir, depth) => {
        const rawStem = random(62, 72)
        const rawBack = rawStem + random(4, 7)
        const bx = clamp(x - dir * random(3, 5), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} Q${x},${dY(rawStem + 1, depth)} ${bx},${dY(rawBack, depth)}`
    },
    // Out (horizontal break toward sideline)
    (x, y0, dir, depth) => {
        const rawStem = random(48, 62)
        const s = dY(rawStem, depth)
        const ex = clamp(x - dir * random(15, 22), 3, 97)
        return `M${x},${y0} L${x},${s} Q${x - dir * 4},${s} ${ex},${s}`
    },
    // Corner (break toward sideline and upfield)
    (x, y0, dir, depth) => {
        const rawStem = random(42, 55)
        const rawEnd = random(10, 22)
        const ex = clamp(x - dir * random(14, 22), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} Q${x - dir * 3},${dY(rawStem - 4, depth)} ${ex},${dY(rawEnd, depth)}`
    },
    // Post (break toward center of field, deep)
    (x, y0, dir, depth) => {
        const rawStem = random(42, 55)
        const rawEnd = random(8, 18)
        const ex = clamp(x + dir * random(16, 28), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} Q${x + dir * 3},${dY(rawStem - 4, depth)} ${ex},${dY(rawEnd, depth)}`
    },
    // Slant (quick inside cut)
    (x, y0, dir, depth) => {
        const rawStem = random(80, 88)
        const rawEnd = rawStem - random(14, 22)
        const ex = clamp(x + dir * random(12, 18), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} L${ex},${dY(rawEnd, depth)}`
    },
    // Comeback (deep stem, break back toward sideline)
    (x, y0, dir, depth) => {
        const rawStem = random(35, 48)
        const rawBack = rawStem + random(10, 16)
        const bx = clamp(x - dir * random(5, 10), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} Q${x},${dY(rawStem + 4, depth)} ${bx},${dY(rawBack, depth)}`
    },
]

const slotRoutes: RouteFn[] = [
    // Slant
    (x, y0, dir, depth) => {
        const rawStem = random(78, 87)
        const rawEnd = rawStem - random(12, 18)
        const ex = clamp(x + dir * random(10, 16), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} L${ex},${dY(rawEnd, depth)}`
    },
    // Dig / In
    (x, y0, dir, depth) => {
        const rawStem = random(48, 60)
        const s = dY(rawStem, depth)
        const ex = clamp(x + dir * random(16, 25), 3, 97)
        return `M${x},${y0} L${x},${s} Q${x + dir * 3},${s} ${ex},${dY(rawStem - 1, depth)}`
    },
    // Seam (vertical up the hash)
    (x, y0, _, depth) => {
        const rawEnd = random(8, 18)
        const drift = random(-2, 2)
        return `M${x},${y0} C${x},${dY(y0 - 20, depth)} ${x + drift},${dY(rawEnd + 15, depth)} ${x + drift},${dY(rawEnd, depth)}`
    },
    // Out (break toward sideline)
    (x, y0, dir, depth) => {
        const rawStem = random(50, 65)
        const s = dY(rawStem, depth)
        const ex = clamp(x - dir * random(12, 20), 3, 97)
        return `M${x},${y0} L${x},${s} Q${x - dir * 3},${s} ${ex},${s}`
    },
    // Over / Cross (deep crossing route)
    (x, y0, dir, depth) => {
        const rawStem = random(55, 68)
        const s = dY(rawStem, depth)
        const ex = clamp(x + dir * random(22, 38), 3, 97)
        return `M${x},${y0} L${x},${s} Q${x + dir * 6},${s} ${ex},${dY(rawStem - 2, depth)}`
    },
    // Wheel (arc out then vertical)
    (x, y0, dir, depth) => {
        const rawStem = random(72, 83)
        const rawEnd = random(15, 28)
        const mx = clamp(x - dir * random(8, 12), 3, 97)
        return `M${x},${y0} L${x},${dY(rawStem, depth)} Q${x - dir * 2},${dY(rawStem - 3, depth)} ${mx},${dY(rawStem - 6, depth)} C${mx},${dY(rawStem - 10, depth)} ${mx},${dY(rawEnd + 10, depth)} ${mx},${dY(rawEnd, depth)}`
    },
]

const middleRoutes: RouteFn[] = [
    // Flat (quick release to the flat)
    (x, y0, _, depth) => {
        const dir = Math.random() < 0.5 ? 1 : -1
        const rawEnd = y0 - random(6, 12)
        const ex = clamp(x + dir * random(16, 26), 3, 97)
        return `M${x},${y0} Q${x + dir * 5},${dY(y0 - 2, depth)} ${ex},${dY(rawEnd, depth)}`
    },
    // Angle (release, plant, break upfield)
    (x, y0, _, depth) => {
        const dir = Math.random() < 0.5 ? 1 : -1
        const rawStem = y0 - random(6, 12)
        const rawEnd = rawStem - random(14, 22)
        const mx = clamp(x - dir * random(4, 8), 3, 97)
        const ex = clamp(x + dir * random(12, 20), 3, 97)
        const s = dY(rawStem, depth)
        return `M${x},${y0} Q${x - dir * 2},${s} ${mx},${s} L${ex},${dY(rawEnd, depth)}`
    },
    // Wheel (swing out, turn upfield)
    (x, y0, _, depth) => {
        const dir = Math.random() < 0.5 ? 1 : -1
        const rawFlat = y0 - random(4, 8)
        const rawEnd = random(18, 32)
        const f = dY(rawFlat, depth)
        const mx = clamp(x + dir * random(10, 16), 3, 97)
        return `M${x},${y0} Q${x + dir * 4},${f} ${mx},${f} C${mx + dir * 2},${dY(rawFlat - 5, depth)} ${mx},${dY(rawEnd + 10, depth)} ${mx},${dY(rawEnd, depth)}`
    },
    // Seam (straight up the middle)
    (x, y0, _, depth) => {
        const rawEnd = random(12, 25)
        return `M${x},${y0} C${x},${dY(y0 - 15, depth)} ${x},${dY(rawEnd + 15, depth)} ${x},${dY(rawEnd, depth)}`
    },
    // Swing (arc out to the flat, staying shallow)
    (x, y0, _, depth) => {
        const dir = Math.random() < 0.5 ? 1 : -1
        const rawEnd = y0 - random(2, 8)
        const e = dY(rawEnd, depth)
        const ex = clamp(x + dir * random(18, 30), 3, 97)
        return `M${x},${y0} C${x},${dY(y0 - 3, depth)} ${x + dir * 10},${e} ${ex},${e}`
    },
]

function getPoolByPosition(centerPct: number): RouteFn[] {
    if (centerPct < 22 || centerPct > 78) return outsideRoutes
    if (centerPct < 38 || centerPct > 62) return slotRoutes
    return middleRoutes
}

function generateWave(config: WaveConfig): AnimatedRoute[] {
    const count = randomInt(config.routeMin, config.routeMax)
    const lanes = generateLanes(config.laneCount)

    const indices = Array.from({ length: config.laneCount }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const chosen = indices.slice(0, count).sort((a, b) => a - b)
    const mirror = Math.random() < 0.5
    const offset = random(-3, 3)
    const staggerStep = Math.min(MAX_TOTAL_STAGGER / count, 0.8)

    return chosen.map((laneIdx, i) => {
        const lane = lanes[laneIdx]
        let x = lane.center + random(-lane.jitter, lane.jitter) + offset
        if (mirror) x = 100 - x
        x = clamp(x, 3, 97)
        const inDir = x < 50 ? 1 : -1
        const pool = getPoolByPosition(lane.center)

        return {
            id: routeIdGen++,
            path: pick(pool)(x, Y0, inDir, config.depth),
            delay: i * random(staggerStep * 0.6, staggerStep),
            startX: x,
        }
    })
}

export default function PlaybookBackground() {
    const [routes, setRoutes] = useState<AnimatedRoute[]>([])
    const [hasMeasured, setHasMeasured] = useState(false)
    const completedRef = useRef(0)
    const routeCountRef = useRef(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const mountedRef = useRef(true)
    const widthRef = useRef(0)
    const heightRef = useRef(0)

    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    useEffect(() => {
        const check = () => {
            widthRef.current = window.innerWidth
            heightRef.current = window.innerHeight
            setHasMeasured(true)
        }
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    const startNextWave = useCallback(() => {
        if (!mountedRef.current) return
        const config = getWaveConfig(widthRef.current, heightRef.current)
        const wave = generateWave(config)
        completedRef.current = 0
        routeCountRef.current = wave.length
        timerRef.current = null
        setRoutes(wave)
    }, [])

    useEffect(() => {
        if (!hasMeasured) return
        startNextWave()
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [hasMeasured, startNextWave])

    const handleAnimationEnd = useCallback(() => {
        completedRef.current += 1
        if (completedRef.current >= routeCountRef.current && !timerRef.current) {
            timerRef.current = setTimeout(() => {
                startNextWave()
            }, INTER_WAVE_GAP * 1000)
        }
    }, [startNextWave])

    if (!hasMeasured || routes.length === 0) return null

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ opacity: 0.3 }}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="routeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {routes.map((route) => (
                    <g key={route.id}>
                        <defs>
                            <mask id={`m-${route.id}`}>
                                <path
                                    d={route.path}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="pb-mask"
                                    style={{ animationDelay: `${route.delay}s` }}
                                />
                            </mask>
                        </defs>

                        <path
                            d={route.path}
                            fill="none"
                            stroke="var(--text-secondary)"
                            strokeWidth="0.35"
                            strokeLinecap="round"
                            strokeDasharray="1 2.5"
                            mask={`url(#m-${route.id})`}
                            className="pb-trail"
                            style={{ animationDelay: `${route.delay}s` }}
                        />

                        <path
                            d={route.path}
                            fill="none"
                            stroke="url(#routeGrad)"
                            strokeWidth="0.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="pb-runner"
                            style={{ animationDelay: `${route.delay}s` }}
                            onAnimationEnd={handleAnimationEnd}
                        />

                        <circle
                            cx={route.startX}
                            cy={Y0.toString()}
                            r="0.5"
                            fill="var(--text-secondary)"
                            className="pb-dot"
                            style={{ animationDelay: `${route.delay}s` }}
                        />
                    </g>
                ))}
            </svg>

            <style jsx>{`
                .pb-runner {
                    stroke-dasharray: 200;
                    stroke-dashoffset: 200;
                    opacity: 0;
                    animation: pbDraw ${WAVE_DURATION}s ease-in-out forwards;
                }
                .pb-mask {
                    stroke-dasharray: 200;
                    stroke-dashoffset: 200;
                    animation: pbMask ${WAVE_DURATION}s ease-in-out forwards;
                }
                .pb-trail {
                    opacity: 0;
                    animation: pbTrail ${WAVE_DURATION}s linear forwards;
                }
                .pb-dot {
                    opacity: 0;
                    animation: pbDot ${WAVE_DURATION}s ease-in-out forwards;
                }

                @keyframes pbDraw {
                    0%   { stroke-dashoffset: 200; opacity: 0; }
                    3%   { opacity: 0.85; }
                    30%  { stroke-dashoffset: 0; opacity: 0.85; }
                    55%  { stroke-dashoffset: 0; opacity: 0.6; }
                    80%  { stroke-dashoffset: 0; opacity: 0; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                }

                @keyframes pbMask {
                    0%   { stroke-dashoffset: 200; }
                    30%  { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 0; }
                }

                @keyframes pbTrail {
                    0%   { opacity: 0; }
                    5%   { opacity: 0.35; }
                    65%  { opacity: 0.3; }
                    85%  { opacity: 0; }
                    100% { opacity: 0; }
                }

                @keyframes pbDot {
                    0%   { opacity: 0; }
                    5%   { opacity: 0.5; }
                    65%  { opacity: 0.4; }
                    85%  { opacity: 0; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    )
}
