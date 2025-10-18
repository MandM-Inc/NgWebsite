'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import BrainLogo from './BrainLogo'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/posts', label: 'Posts' },
  { href: '/events', label: 'Events' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 nav-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="text-white/70">
              <BrainLogo className="w-8 h-8" animated={true} />
            </div>
            <span className="text-xl font-semibold text-white">
              NeuroGeneration
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative py-2 transition-colors ${
                      isActive
                        ? 'text-white font-medium'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-purple-700" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white/70 hover:text-white hover:bg-purple-900/30 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 md:hidden z-40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div
            id="mobile-menu"
            className="fixed top-0 right-0 bottom-0 w-72 max-w-[80%] bg-black border-l border-purple-700/40 md:hidden flex flex-col z-50"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-purple-700/40">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-purple-900/30 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-base transition-colors ${
                      isActive
                        ? 'text-white font-medium bg-black'
                        : 'text-white/70 hover:text-white hover:bg-black'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
