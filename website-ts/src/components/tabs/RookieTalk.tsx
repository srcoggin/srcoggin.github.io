'use client'

import { useState, useEffect, useMemo } from 'react'
import Divider from '@/components/Divider'
import InfoBox from '@/components/InfoBox'
import TeamName from '@/components/TeamName'
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
const DYNASTY_TOP_10: Record<string, { tier: string; analysis: string; rank: number; position: string; team: string; college: string; pick: string }> = {
    'Jeremiyah Love': {
        tier: 'S-Tier',
        rank: 1,
        position: 'RB',
        team: 'Cowboys',
        college: 'Notre Dame',
        pick: 'Projected 1st',
        analysis: 'A rare three-down workhorse build (6\'0", 215lbs) with elite 4.4 speed. His contact balance and vision in zone schemes echo Jahmyr Gibbs, but with more power. With Alvin Kamara\'s production finally coming down, Love is poised to take over as the lead back in a run-heavy offense. A bona fide fantasy RB1 from Day 1.',
    },
    'Carnell Tate': {
        tier: 'S-Tier',
        rank: 2,
        position: 'WR',
        team: 'Steelers',
        college: 'Ohio State',
        pick: 'Projected 1st',
        analysis: 'The next great Ohio State WR. Possesses a pristine release package and elite ball-tracking skills. While not a burner, his route running and body control make him a safe, high-volume alpha WR1 for the next decade.',
    },
    'Makai Lemon': {
        tier: 'A-Tier',
        rank: 3,
        position: 'WR',
        team: '49ers',
        college: 'USC',
        pick: 'Projected 1st',
        analysis: 'A YAC machine who operates like a modern Deebo Samuel (before all the weight). His ability to create separation from the slot and turn short passes into long touchdowns gives him a massive weekly ceiling in PPR formats. While DBs have all eyes on Garret Wilson, Lemon aims to work the short game and make a man miss, or he will slip behind the secondary into open space, a much needed 3rd dimensional player for Justin Fields.',
    },
    'Jordyn Tyson': {
        tier: 'A-Tier',
        rank: 4,
        position: 'WR',
        team: 'Chiefs',
        college: 'Arizona State',
        pick: 'Projected 1st',
        analysis: 'Explosive "X" receiver traits. Despite previous injury concerns, his vertical leaping ability and catch radius are elite. He wins 50/50 balls at a dominant rate, making him a red-zone favorite. On top of Miamis WR1 most likely hanging up the cleats (at least for Miami), Tyson aims to add another dimension to the otherwise speed-heavy reciever room',
    },
    'Fernando Mendoza': {
        tier: 'A-Tier',
        rank: 5,
        position: 'QB',
        team: 'Raiders',
        college: 'Cal',
        pick: 'Projected 1st',
        analysis: 'The safest QB floor in the class. Arguably the best processor since Burrow and concencist first pick in the 2026 nfl draft, he dissects coverages with surgical precision. While he lacks consistent rushing upside, he is prone to work off-script and make plays when things break down. His passing volume guarantees high-end QB2 production, ready to step in on bye weeks or when your Lamar goes down.',
    },
    'Denzel Boston': {
        tier: 'A-Tier',
        rank: 6,
        position: 'WR',
        team: 'Buccaneers',
        college: 'Washington',
        pick: 'Projected 2nd',
        analysis: 'A physical anomaly at 6\'4" who moves like a smaller receiver. His production at Washington exploded as a primary target. He offers a "Mike Evans" type ceiling as a perimeter dominant receiver who demands double teams.',
    },
    'Jadarian Price': {
        tier: 'B-Tier',
        rank: 7,
        position: 'RB',
        team: 'Broncos',
        college: 'Notre Dame',
        pick: 'Projected 2nd',
        analysis: 'The lightning to Love\'s thunder. While likely part of a committee, his per-touch efficiency is off the charts. His breakaway speed makes him a "week-winner" flex play with massive upside if he ever gets a lead role.',
    },
    'Justice Haynes': {
        tier: 'B-Tier',
        rank: 8,
        position: 'RB',
        team: 'MIA',
        college: 'Alabama',
        pick: 'Projected 2nd',
        analysis: 'Alabama\'s latest backfield star. Runs with a low center of gravity and incredible burst. While not as big as Love, his efficiency metrics suggest elite fantasy upside in a Shanahan-style zone run scheme.',
    },
    'Jonah Coleman': {
        tier: 'B-Tier',
        rank: 9,
        position: 'RB',
        team: 'Chargers',
        college: 'Washington',
        pick: 'Projected 3rd',
        analysis: 'A bowling ball of a runner who is impossible to tackle on the first hit. His low center of gravity and surprising soft hands make him a PPR sleeper who could sneak into RB2 territory based on sheer volume.',
    },
    'Kenyon Sadiq': {
        tier: 'B-Tier',
        rank: 10,
        position: 'TE',
        team: 'Seahawks',
        college: 'Oregon',
        pick: 'Projected 2nd',
        analysis: 'The athletic "move" TE prototype. He lines up everywhere and creates mismatches against linebackers. If his testing numbers verify his game speed, he could be the rare rookie TE who produces immediately.',
    },
}

// Busts/Disappointing rookies (Risky 2026 Prospects)
const DYNASTY_WORST_10: Record<string, { concern: string; analysis: string; rank: number; position: string; team: string; college: string; pick: string }> = {
    'Squirrel White': {
        concern: 'Size / Durability',
        rank: 1,
        position: 'WR',
        team: 'CAR',
        college: 'Tennessee',
        pick: 'Projected 3rd',
        analysis: 'Electrifying speed but extremely slight frame (165lbs). Historically, players of this size struggle to stay healthy and maintain full-time roles in the NFL. Strict slot/gadget limitation. Match that with a reciever room tied down to Calvin Ridley and Cam Wards college buddy, and playing time starts to become a real question mark.',
    },
    'Carson Beck': {
        concern: 'Usage / inaccurate',
        rank: 2,
        position: 'QB',
        team: 'MIA',
        college: 'Miami',
        pick: 'Projected 3rd',
        analysis: 'In standard scoring, turnovers are costly. Furthermore, Beck offers almost zero rushing upside. In modern fantasy football, an immobile QB who throws interceptions is a "dead zone" asset. He is a "better real life backup than fantasy starter" candidate.',
    },
    'KC Concepcion': {
        concern: 'Low ADOT / Gadget trap',
        rank: 3,
        position: 'WR',
        team: 'NE',
        college: 'NC State',
        pick: 'Projected 3rd',
        analysis: 'Averages a dangerously low depth of target. In the NFL, "gadget" players often struggle to find consistent snaps. If he can\'t develop a downfield route tree, he\'s just a return specialist.',
    },
    'Zachariah Branch': {
        concern: 'Size / Route Running',
        rank: 4,
        position: 'WR',
        team: 'LA',
        college: 'USC',
        pick: 'Projected 3rd',
        analysis: 'Electric with the ball, but at 5\'10" and raw as a route runner, he risks being pigeonholed as a screen merchant. Needs to prove he can win outside to be fantasy viable.',
    },
    'Raleek Brown': {
        concern: 'Positionless / Usage',
        rank: 5,
        position: 'RB',
        team: 'ARI',
        college: 'Arizona State',
        pick: 'Projected 4th',
        analysis: 'Talented athlete who doesn\'t fit a traditional mold. Too small for RB, not polished enough for WR. Often these "offensive weapon" types struggle to find a consistent fantasy role.',
    },
    'Emmett Johnson': {
        concern: 'Undersized / Indecisive',
        rank: 6,
        position: 'RB',
        team: 'MIN',
        college: 'Nebraska',
        pick: 'Projected 4th',
        analysis: 'Has flashed at Nebraska but often dances too much behind the line. At his size, negative plays are drive-killers. NFL coaches bench dancers; he needs to learn to hit the hole to survive.',
    },
    'Chris Bell': {
        concern: 'Crowded WR class',
        rank: 7,
        position: 'WR',
        team: 'TEN',
        college: 'Louisville',
        pick: 'Projected 5th',
        analysis: 'A "good at everything, great at nothing" profile. In a deep WR class, he likely falls to Day 3 draft capital, drastically reducing his chances of seeing the field as a rookie.',
    },
    'Elijah Sarratt': {
        concern: 'System creation',
        rank: 8,
        position: 'WR',
        team: 'IND',
        college: 'Indiana',
        pick: 'Projected 5th',
        analysis: 'Benefited massively from Indiana\'s high-tempo, spread system. There are real questions about his athleticism separating against NFL press coverage. Could be a "system WR" trap.',
    },
    'Trinidad Chambliss': {
        concern: 'Playing time / pro ready-ness',
        rank: 9,
        position: 'QB',
        team: 'IND',
        college: 'Ole Miss',
        pick: 'Projected Late 3rd',
        analysis: 'Big enough body with reasonable decision making. The issue is the 2025 was his first year of D1 Football. With that in mind his stats of 3937 yards and 22 TDs to only 3 INTs is very impressive. The lack of D1 experience makes me question his ability to step up in the pros. Match this with no rushing up-side and a realistic chance Chambliss will not see the field as a rookie, makes him a tough selection to consider.',
    },
    'Barion Brown': {
        concern: 'Drops / Inconsistency',
        rank: 10,
        position: 'WR',
        team: 'JAX',
        college: 'Kentucky',
        pick: 'Projected 4th',
        analysis: 'Elite top-end speed but frustrating hands. Leading the SEC in drops is a massive red flag. Coaches lose trust quickly with drop-prone rookies.',
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
                2026 Rookie Talk - Fantasy Rankings
            </h2>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 break-words text-[var(--text-secondary)]">
                Rookie rankings for the 2026 NFL Draft class. Who to target and who to avoid.
            </p>


            <Divider />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 10 */}
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--accent-green)]">
                        <IconTrendUp size={22} className="flex-shrink-0" />
                        Top 10 Fantasy 2026 Rookie Prospects
                    </h3>
                    <p className="text-sm mb-4 text-[var(--text-secondary)]">
                        The best long-term values from the 2026 rookie class.
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
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadge(
                                                    player.info?.position || player.position
                                                )}`}
                                            >
                                                {player.info?.position || player.position}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full border ${getTierColor(
                                                    player.tier
                                                )}`}
                                            >
                                                {player.tier}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                                            {player.info?.college || player.college} • {player.info?.pick ? `Pick #${player.info.pick}` : player.pick} • <TeamName team={player.info?.team || player.team} />
                                        </p>
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
                        Bottom 10 Fantasy 2026 Rookie Prospects
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
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${getPositionBadge(
                                                    player.info?.position || player.position
                                                )}`}
                                            >
                                                {player.info?.position || player.position}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                                            {player.info?.college || player.college} • {player.info?.pick ? `Pick #${player.info.pick}` : player.pick} • <TeamName team={player.info?.team || player.team} />
                                        </p>
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
                        <strong>Target:</strong> Jeremiyah Love, Carnell Tate, and Fernando Mendoza at the top of
                        your rookie drafts
                    </li>
                    <li>
                        <strong>Value:</strong> Denzel Boston and Justice Haynes offer elite upside if
                        they fall
                    </li>
                    <li>
                        <strong>Avoid:</strong> KC Concepcion and Barion Brown are being overdrafted based
                        on name recognition
                    </li>
                    <li>
                        <strong>Sleeper:</strong> Kenyon Sadiq could be this year&apos;s Brock Bowers if
                        he tests well
                    </li>
                </ul>
            </InfoBox>
        </div>
    )
}
