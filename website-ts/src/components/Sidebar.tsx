'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, mounted } = useTheme()

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Fantasy Football', path: '/tools', icon: '🏈' },
  ]

  return (
    <aside 
      className={`
        w-64 min-h-screen border-r flex flex-col transition-colors duration-300
        ${theme === 'dark' 
          ? 'bg-[#1a1d24] border-[#30363d]' 
          : 'bg-[#f6f8fa] border-[#d0d7de]'
        }
      `}
    >
      <div className="p-4">
        <h2 className={`
          text-lg font-bold mb-4
          ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'}
        `}>
          Navigation
        </h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : theme === 'dark'
                    ? 'text-[#f0f6fc] hover:bg-[#30363d]'
                    : 'text-[#1f2328] hover:bg-[#eaeef2]'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
