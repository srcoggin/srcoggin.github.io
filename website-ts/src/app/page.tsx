'use client'

import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import InfoBox from '@/components/InfoBox'
import Divider from '@/components/Divider'

export default function Home() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 box-border">
      {/* Theme selector - Top Right */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
        <Image
          src="/Logo.png"
          alt="The Expert Football Logo"
          width={80}
          height={80}
          className="rounded-lg flex-shrink-0 sm:w-[100px] sm:h-[100px]"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left text-[var(--text-primary)]">
          The Expert Football
        </h1>
      </div>

      <p className="text-xs sm:text-sm mb-6 text-[var(--text-secondary)]">
        Your Hub for Advanced Sports Analytics
        (Powered by NFLVerse)
      </p>

      <Divider />

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column - Latest News & CTA */}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--text-primary)]">
            📰 Latest Updates
          </h2>

          <InfoBox type="info" className="mb-4">
            📅 <strong>Jan 2026:</strong> Website Launched!
          </InfoBox>

          <ul className="space-y-2 mb-8 text-sm sm:text-base break-words text-[var(--text-primary)]">
            <li>• <strong>New:</strong> Rookie Talk tab with top 10 best/worst 2026 dynasty prospects!</li>
            <li>• <strong>New:</strong> 2026 NFL Draft prospects section with top fantasy picks.</li>
            <li>• <strong>Improved:</strong> Faster data loading - all seasons load in parallel.</li>
            <li>• <strong>Added:</strong> Deep Dive tool with player search, stats, and EPA analysis.</li>
            <li>• <strong>Updated:</strong> 2025 season data now fully available.</li>
          </ul>

          {/* Call to Action */}
          <div className="p-4 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-[var(--text-primary)]">
              🏈 Ready to analyze?
            </h3>
            <p className="text-sm sm:text-base break-words text-[var(--text-primary)]">
              👈 Click <strong>&apos;Fantasy Football&apos;</strong> in the sidebar to access the tools.
            </p>
          </div>
        </div>

        {/* Right Column - About */}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--text-primary)]">
            👋 About This Site
          </h2>

          <div className="p-4 sm:p-5 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border-color)]">
            <p className="mb-4 text-sm sm:text-base break-words text-[var(--text-primary)]">
              Hey! I&apos;m a small-time coder and a <strong className="text-purple-500">massive Baltimore Ravens fan</strong> 🦅💜.
              I built this site because my buddies and I needed an easier way to access NFL stats
              and fantasy football data in a format that actually made sense to us.
            </p>
            <p className="mb-4 text-sm sm:text-base break-words text-[var(--text-primary)]">
              Tired of jumping between a dozen different sites just to compare players or look up
              EPA stats? Same. So I made this — a simple hub where we can dig into the numbers,
              track draft prospects, and settle debates with actual data.
            </p>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm italic break-words">
              Built with Next.js, React, and way too many cursor prompts.
              Hope you find it useful!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
