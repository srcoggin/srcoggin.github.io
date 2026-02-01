'use client'

import { useState, useEffect, useMemo } from 'react'
import Divider from '@/components/Divider'
import InfoBox from '@/components/InfoBox'
import { IconTrendUp, IconTrendDown, IconStar, IconWarning } from '@/components/Icons'

interface DraftPick {
    pick: number
    round: number
    team: string
    player_name: string
    position: string
    college: string
    height: string
    weight: number
    stats: Record<string, number>
}

interface MockDraftData {
    picks: DraftPick[]
}

// Dynasty value tiers and analysis
const DYNASTY_TOP_10: Record<string, { tier: string; analysis: string; rank: number }> = {
    'Ashton Jeanty': {
        tier: 'S-Tier',
        rank: 1,
        analysis: 'Generational RB prospect. Despite poor offensive line play, led NFL rookies in rushing yards. Elite contact balance and vision make him a foundation piece for any dynasty roster.',
    },
    'Tetairoa McMillan': {
        tier: 'S-Tier',
        rank: 2,
        analysis: 'Elite contested-catch specialist at 6\'5" with WR1 upside. Premium alpha receiver profile with the physicality to dominate in the red zone.',
    },
    'Cam Ward': {
        tier: 'A-Tier',
        rank: 3,
        analysis: 'Electric playmaker with rushing upside. Top QB in this class with the arm talent and mobility to be a fantasy QB1 for years.',
    },
    'Luther Burden III': {
        tier: 'A-Tier',
        rank: 4,
        analysis: 'Elite route runner with YAC ability. Slot-heavy profile but dominant efficiency metrics suggest WR1 ceiling in PPR formats.',
    },
    'Jaxson Dart': {
        tier: 'A-Tier',
        rank: 5,
        analysis: 'Dual-threat QB with excellent rushing floor. Improved accuracy as a pro and showed poise under pressure. Long-term starter.',
    },
    'Omarion Hampton': {
        tier: 'A-Tier',
        rank: 6,
        analysis: 'Three-down back with pass-catching ability. Excellent prospect profile with size, speed, and receiving chops to be a bell-cow.',
    },
    'Emeka Egbuka': {
        tier: 'B-Tier',
        rank: 7,
        analysis: 'Reliable route runner with high floor. May lack alpha upside but consistent production makes him a safe WR2 asset.',
    },
    'Colston Loveland': {
        tier: 'B-Tier',
        rank: 8,
        analysis: 'Athletic TE with big-play ability. In the right offense, has TE1 upside. Premium dynasty asset at a scarce position.',
    },
    'Travis Hunter': {
        tier: 'B-Tier',
        rank: 9,
        analysis: 'Two-way star focusing on WR. Elite athlete with unique versatility. Fantasy value hinges on offensive role clarity.',
    },
    'Kaleb Johnson': {
        tier: 'B-Tier',
        rank: 10,
        analysis: 'Powerful runner with breakaway speed. Strong combine performance confirms the tape. High-upside RB2 with RB1 ceiling.',
    },
}

// Busts/Disappointing rookies
const DYNASTY_WORST_10: Record<string, { concern: string; analysis: string; rank: number }> = {
    'Shedeur Sanders': {
        concern: 'Limited rushing upside',
        rank: 1,
        analysis: 'Despite the hype, pocket-only style limits fantasy ceiling. Questionable decision-making under pressure hurt his rookie campaign.',
    },
    'Quinn Ewers': {
        concern: 'Injury history',
        rank: 2,
        analysis: 'Talented but has struggled to stay healthy. Limited mobility and durability concerns tank long-term dynasty value.',
    },
    'Carson Beck': {
        concern: 'Developmental project',
        rank: 3,
        analysis: 'Raw prospect who needs time. In deep rookie classes, there are safer options than a multi-year project.',
    },
    'TreVeyon Henderson': {
        concern: 'Durability red flags',
        rank: 4,
        analysis: 'Electric talent but constant injuries cap his ceiling. Hard to trust in dynasty builds with such fragile profile.',
    },
    'Cam Skattebo': {
        concern: 'Limited draft capital',
        rank: 5,
        analysis: 'Day 3 pick in a deep RB class. Will struggle for touches and may never see a bell-cow role.',
    },
    'J. Michael Sturdivant': {
        concern: 'Crowded WR room',
        rank: 6,
        analysis: 'Landed in a target-starved situation. Good player in a bad fantasy landing spot.',
    },
    'Pat Bryant': {
        concern: 'Scheme-dependent',
        rank: 7,
        analysis: 'Deep threat only. Limited route tree caps target share and makes him boom-or-bust each week.',
    },
    'Kyle Williams': {
        concern: 'Low draft capital',
        rank: 8,
        analysis: 'Late-round WR in a crowded class. Path to targets is muddy at best.',
    },
    'Terrance Ferguson': {
        concern: 'Blocking TE role',
        rank: 9,
        analysis: 'Drafted primarily for blocking. Will rarely see fantasy-relevant target share.',
    },
    'Kyle Monangai': {
        concern: 'Committee back',
        rank: 10,
        analysis: 'Landed in a timeshare situation with little path to featured role. Limited weekly upside.',
    },
}

export default function RookieTalk() {
    const [mockDraft, setMockDraft] = useState<MockDraftData | null>(null)

    // Load mock draft data
    useEffect(() => {
        const loadMockDraft = async () => {
            try {
                const response = await fetch('/json_data/mock_draft.json')
                if (response.ok) {
                    const data = await response.json()
                    setMockDraft(data)
                }
            } catch (error) {
                console.error('Error loading mock draft:', error)
            }
        }
        loadMockDraft()
    }, [])

    // Get player info from mock draft if available
    const getPlayerInfo = (name: string): DraftPick | undefined => {
        return mockDraft?.picks.find((p) => p.player_name === name)
    }

    const top10Players = useMemo(() => {
        return Object.entries(DYNASTY_TOP_10)
            .sort((a, b) => a[1].rank - b[1].rank)
            .map(([name, data]) => ({ name, ...data, info: getPlayerInfo(name) }))
    }, [mockDraft])

    const worst10Players = useMemo(() => {
        return Object.entries(DYNASTY_WORST_10)
            .sort((a, b) => a[1].rank - b[1].rank)
            .map(([name, data]) => ({ name, ...data, info: getPlayerInfo(name) }))
    }, [mockDraft])

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'S-Tier':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            case 'A-Tier':
                return 'bg-green-500/20 text-green-400 border-green-500/40'
            case 'B-Tier':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
        }
    }

    const getPositionBadge = (position: string) => {
        const p = (position ?? '').trim().toUpperCase()
        switch (p) {
            case 'QB':
                return 'bg-red-500/20 text-red-400'
            case 'RB':
                return 'bg-green-500/20 text-green-400'
            case 'WR':
                return 'bg-blue-500/20 text-blue-400'
            case 'TE':
                return 'bg-orange-500/20 text-orange-400'
            default:
                return 'bg-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className="min-w-0 w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words text-[var(--text-primary)] flex items-center gap-2">
                <IconStar size={24} className="flex-shrink-0 text-amber-500" />
                2026 Rookie Talk - Dynasty Rankings
            </h2>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 break-words text-[var(--text-secondary)]">
                Dynasty rookie rankings for the 2025 NFL Draft class. Who to target and who to avoid.
            </p>

            <InfoBox type="info" className="mb-6">
                <strong>Dynasty Focus:</strong> These rankings prioritize long-term value over immediate
                production. Consider landing spot, draft capital, and career trajectory when making
                dynasty decisions.
            </InfoBox>

            <Divider />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 10 */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--accent-green)]">
                        <IconTrendUp size={22} className="flex-shrink-0" />
                        Top 10 Dynasty Prospects
                    </h3>
                    <p className="text-sm mb-4 text-[var(--text-secondary)]">
                        The best long-term values from the 2025 rookie class.
                    </p>

                    <div className="space-y-3">
                        {top10Players.map((player, index) => (
                            <div
                                key={player.name}
                                className="p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Rank badge */}
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center text-[var(--accent-green)] font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-[var(--text-primary)]">
                                                {player.name}
                                            </span>
                                            {player.info && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadge(
                                                        player.info.position
                                                    )}`}
                                                >
                                                    {player.info.position}
                                                </span>
                                            )}
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full border ${getTierColor(
                                                    player.tier
                                                )}`}
                                            >
                                                {player.tier}
                                            </span>
                                        </div>
                                        {player.info && (
                                            <p className="text-xs text-[var(--text-secondary)] mb-2">
                                                {player.info.college} • Pick #{player.info.pick} • {player.info.team}
                                            </p>
                                        )}
                                        <p className="text-sm text-[var(--text-primary)]">{player.analysis}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Worst 10 */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--accent-red)]">
                        <IconTrendDown size={22} className="flex-shrink-0" />
                        Bottom 10 Dynasty Prospects
                    </h3>
                    <p className="text-sm mb-4 text-[var(--text-secondary)]">
                        Rookies with concerning profiles or situations to avoid.
                    </p>

                    <div className="space-y-3">
                        {worst10Players.map((player, index) => (
                            <div
                                key={player.name}
                                className="p-4 rounded-lg border bg-[var(--bg-secondary)] border-[var(--border-color)]"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Rank badge */}
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent-red)]/20 flex items-center justify-center text-[var(--accent-red)] font-bold text-sm flex-shrink-0">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-[var(--text-primary)]">
                                                {player.name}
                                            </span>
                                            {player.info && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadge(
                                                        player.info.position
                                                    )}`}
                                                >
                                                    {player.info.position}
                                                </span>
                                            )}
                                        </div>
                                        {player.info && (
                                            <p className="text-xs text-[var(--text-secondary)] mb-1">
                                                {player.info.college} • Pick #{player.info.pick} • {player.info.team}
                                            </p>
                                        )}
                                        <p className="text-xs font-medium text-[var(--accent-red)] flex items-center gap-1 mb-2">
                                            <IconWarning size={14} /> {player.concern}
                                        </p>
                                        <p className="text-sm text-[var(--text-primary)]">{player.analysis}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Divider />

            {/* Quick Tips */}
            <InfoBox type="warning" className="mt-6">
                <strong>Dynasty Draft Strategy:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>
                        <strong>Target:</strong> Ashton Jeanty, Tetairoa McMillan, Cam Ward at the top of
                        your rookie drafts
                    </li>
                    <li>
                        <strong>Value:</strong> Luther Burden III and Omarion Hampton offer elite upside if
                        they fall
                    </li>
                    <li>
                        <strong>Avoid:</strong> Shedeur Sanders and Quinn Ewers are being overdrafted based
                        on name recognition
                    </li>
                    <li>
                        <strong>Sleeper:</strong> Colston Loveland could be this year&apos;s Brock Bowers if
                        he lands in the right offense
                    </li>
                </ul>
            </InfoBox>
        </div>
    )
}
