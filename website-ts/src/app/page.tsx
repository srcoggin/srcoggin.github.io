'use client'

import { useState } from 'react'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'
import InfoBox from '@/components/InfoBox'
import Divider from '@/components/Divider'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { theme } = useTheme()
  const [cacheCleared, setCacheCleared] = useState(false)

  const handleForceUpdate = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nfl_data_cache')
      sessionStorage.clear()
    }
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 3000)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Theme Toggle - Top Right */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="flex items-center gap-4 mb-2">
        <Image
          src="/Logo.png"
          alt="The Expert Football Logo"
          width={100}
          height={100}
          className="rounded-lg"
        />
        <h1 className={`
          text-4xl font-bold
          ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
        `}>
          The Expert Football
        </h1>
      </div>
      
      <p className={`
        text-sm mb-6
        ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
      `}>
        Your Hub for Advanced Sports Analytics
      </p>

      <Divider />

      {/* News & Updates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Latest News */}
        <div>
          <h2 className={`
            text-2xl font-bold mb-4
            ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
          `}>
            📰 Latest News
          </h2>
          
          <InfoBox type="info" className="mb-4">
            📅 <strong>Feb 2026:</strong> 2024 Season Data is now fully finalized.
          </InfoBox>
          
          <ul className={`
            space-y-2
            ${theme === 'dark' ? 'text-[#c9d1d9]' : 'text-[#1f2328]'}
          `}>
            <li>• <strong>New Feature:</strong> Boom/Bust Radar now supports position filtering.</li>
            <li>• <strong>Data Update:</strong> Corrected EPA calculations for Week 14.</li>
            <li>• <strong>Community:</strong> Join our Discord to request new stats!</li>
          </ul>
        </div>

        {/* System Status */}
        <div>
          <h2 className={`
            text-2xl font-bold mb-4
            ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
          `}>
            🛠️ System Status
          </h2>
          
          <InfoBox type="success" className="mb-3">
            ✅ <strong>NFL Database:</strong> Online
          </InfoBox>
          
          <InfoBox type="success" className="mb-3">
            ✅ <strong>Calculation Engine:</strong> Operational
          </InfoBox>
          
          <InfoBox type="warning" className="mb-4">
            ⚠️ <strong>Maintenance:</strong> Scheduled for Tuesday 3 AM EST
          </InfoBox>

          <button
            onClick={handleForceUpdate}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              bg-blue-600 text-white hover:bg-blue-700
              flex items-center gap-2 shadow-lg shadow-blue-600/20
            `}
          >
            🔄 Force Update Data
          </button>

          {cacheCleared && (
            <InfoBox type="success" className="mt-3">
              Data cache cleared! Refresh the page to download the latest stats.
            </InfoBox>
          )}
        </div>
      </div>

      <Divider />

      {/* Call to Action */}
      <div>
        <h3 className={`
          text-xl font-bold mb-2
          ${theme === 'dark' ? 'text-[#f0f6fc]' : 'text-[#1f2328]'}
        `}>
          🏈 Ready to analyze?
        </h3>
        <h4 className={`
          text-lg
          ${theme === 'dark' ? 'text-[#c9d1d9]' : 'text-[#1f2328]'}
        `}>
          👈 Click <strong>&apos;Fantasy Football&apos;</strong> in the sidebar to access the tools.
        </h4>
      </div>
    </div>
  )
}
