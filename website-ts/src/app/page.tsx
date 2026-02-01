'use client'

import Link from 'next/link'
import Image from 'next/image'
import InfoBox from '@/components/InfoBox'
import Divider from '@/components/Divider'
import NavigationBox from '@/components/NavigationBox'
import PlaybookBackground from '@/components/PlaybookBackground'
import { IconLiveUpdates, IconLaunch, IconAnalytics, IconSidebarNav, IconDevProfile } from '@/components/Icons'

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Animated Background */}
      <PlaybookBackground />

      <div className="content-width flex-1 relative z-10">
        {/* Hero – full-width feel, clear hierarchy */}
        <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 text-center">
          <div className="flex flex-col items-center gap-3 mb-2">
            {/* Using standard img tag to prevent Next.js optimization/downscaling artifacts */}
            <Image
              src="/Logo.png"
              alt="GreenEighteen Sports Logo"
              width={190}
              height={190}
              className="w-[142px] h-[142px] sm:w-[190px] sm:h-[190px] object-contain rounded-3xl shadow-lg border-2 border-[var(--border-color)] hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              GreenEighteen Sports
            </h1>
          </div>
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
              <li><strong>New:</strong> <strong>AI News Feed</strong> Scrapes NFL News and provides auto-generated summaries.</li>
              <li><strong>New:</strong> &quot;GES&apos;s News&quot; tab - Exclusive Baltimore Ravens coverage.</li>
              <li><strong>New:</strong> 2026 NFL Draft & Dynasty Rookie rankings.</li>
              <li><strong>Improved:</strong> Sidebar navigation with direct access to News & Tools.</li>
              <li><strong>Updated:</strong> 2025 season data now fully available.</li>
            </ul>


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

        <Divider />

        {/* Navigation Box for new users */}
        <NavigationBox />
      </div>
    </div>
  )
}
