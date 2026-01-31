'use client'

import Link from 'next/link'
import InfoBox from '@/components/InfoBox'
import Divider from '@/components/Divider'
import { IconLiveUpdates, IconLaunch, IconAnalytics, IconSidebarNav, IconDevProfile } from '@/components/Icons'

export default function Home() {
  return (
    <div className="content-width flex-1">
      {/* Hero – full-width feel, clear hierarchy */}
      <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          The Expert Football
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
          Your hub for NFL stats and fantasy football (powered by NFLVerse)
        </p>
      </section>

      <Divider />

      {/* Main content – single column on small, two columns on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 pb-10 sm:pb-14" id="updates">
        {/* Left: What&apos;s New */}
        <section className="min-w-0 order-2 md:order-1">
          <p className="section-label flex items-center gap-2 mb-1">
            <IconLiveUpdates size={14} className="flex-shrink-0 opacity-80" />
            Latest Updates
          </p>
          <h2 className="section-heading mb-4">What&apos;s New</h2>

          <InfoBox type="info" className="mb-5 flex items-start gap-3">
            <IconLaunch size={20} className="flex-shrink-0 mt-0.5 text-[var(--accent-primary)]" />
            <span><strong>Jan 2026:</strong> Website launched.</span>
          </InfoBox>

          <ul className="space-y-2.5 mb-6 text-sm sm:text-base break-words text-[var(--text-primary)] list-disc list-inside">
            <li><strong>New:</strong> Rookie Talk tab with top 10 best/worst 2026 dynasty prospects.</li>
            <li><strong>New:</strong> 2026 NFL Draft prospects section with top fantasy picks.</li>
            <li><strong>Improved:</strong> Faster data loading — all seasons load in parallel.</li>
            <li><strong>Added:</strong> Deep Dive tool with player search, stats, and EPA analysis.</li>
            <li><strong>Updated:</strong> 2025 season data now fully available.</li>
          </ul>

          <div className="content-card border-l-4 border-l-[var(--accent-primary)] p-4">
            <h3 className="text-base font-bold mb-2 text-[var(--text-primary)] flex items-center gap-2">
              <IconAnalytics size={20} className="flex-shrink-0 text-[var(--accent-primary)]" />
              Ready to analyze?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 break-words flex items-center gap-2">
              <IconSidebarNav size={16} className="flex-shrink-0 opacity-70" />
              Use <strong>Fantasy Football</strong> in the sidebar for all tools.
            </p>
            <Link
              href="/fantasy-football"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-[var(--accent-primary)] hover:opacity-90 transition-opacity"
            >
              <IconAnalytics size={18} />
              Go to Fantasy Football
            </Link>
          </div>
        </section>

        {/* Right: About */}
        <section className="min-w-0 order-1 md:order-2">
          <p className="section-label flex items-center gap-2 mb-1">
            <IconDevProfile size={14} className="flex-shrink-0 opacity-80" />
            About
          </p>
          <h2 className="section-heading mb-4">About This Site</h2>

          <div className="content-card p-5">
            <p className="mb-4 text-sm sm:text-base break-words text-[var(--text-primary)]">
              Hey! I&apos;m a small-time coder and a{' '}
              <strong className="text-purple-500">massive Baltimore Ravens fan</strong>.
              I built this site because my buddies and I needed an easier way to access NFL stats
              and fantasy football data in a format that actually made sense to us.
            </p>
            <p className="mb-4 text-sm sm:text-base break-words text-[var(--text-primary)]">
              Tired of jumping between a dozen different sites just to compare players or look up
              EPA stats? Same. So I made this — a simple hub where we can dig into the numbers,
              track draft prospects, and settle debates with actual data.
            </p>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm italic break-words">
              Built with Next.js, React, and way too many cursor prompts. Hope you find it useful!
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
