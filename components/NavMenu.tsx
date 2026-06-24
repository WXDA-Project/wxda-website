'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type NavChild = { href: string; label: string }
type NavLink = { href?: string; label: string; children?: NavChild[] }

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/map', label: 'Map' },
  { href: '/blog', label: 'Blog' },
  { href: '/advisory-board', label: 'Advisory Board' },
  {
    label: 'About',
    children: [
      { href: '/about', label: 'About the Project' },
      { href: '/about/history', label: 'History' },
      { href: '/about/news', label: 'News' },
    ],
  },
]

export default function NavMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDesktopDropdownOpen(true)
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setDesktopDropdownOpen(false), 120)
  }

  return (
    <>
      {/* Desktop nav */}
      <nav aria-label="Main navigation" className="hidden sm:block">
        <ul className="flex gap-4 sm:gap-6 list-none m-0 p-0 text-sm">
          {NAV_LINKS.map((item) =>
            item.children ? (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setDesktopDropdownOpen((o) => !o)}
                  aria-expanded={desktopDropdownOpen}
                  aria-haspopup="menu"
                  className="hover:opacity-75 transition-opacity whitespace-nowrap bg-transparent border-0 cursor-pointer p-0 text-sm text-header-fg"
                >
                  {item.label}
                  <span aria-hidden="true" className="ml-1 text-xs opacity-70">▾</span>
                </button>

                {desktopDropdownOpen && (
                  <ul
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 min-w-max bg-header-bg border border-white/20 rounded shadow-lg z-50 list-none m-0 p-1"
                  >
                    {item.children.map((child) => (
                      <li key={child.href} role="none">
                        <Link
                          href={child.href}
                          role="menuitem"
                          onClick={() => setDesktopDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-header-fg hover:bg-white/10 transition-colors rounded whitespace-nowrap"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link href={item.href!} className="hover:opacity-75 transition-opacity whitespace-nowrap">
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden text-2xl leading-none text-header-fg bg-transparent border-0 cursor-pointer px-1 py-0.5"
      >
        <span aria-hidden="true">{mobileOpen ? '×' : '☰'}</span>
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Main navigation"
          className="sm:hidden absolute left-0 right-0 top-full bg-header-bg border-t border-white/10 shadow-lg z-50"
        >
          <ul className="list-none m-0 p-0 text-sm divide-y divide-white/10">
            {NAV_LINKS.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileAboutOpen((o) => !o)}
                    aria-expanded={mobileAboutOpen}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-header-fg hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer text-left"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-xs opacity-70">
                      {mobileAboutOpen ? '▴' : '▾'}
                    </span>
                  </button>
                  {mobileAboutOpen && (
                    <ul className="list-none m-0 p-0 bg-black/20 divide-y divide-white/10">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => { setMobileOpen(false); setMobileAboutOpen(false) }}
                            className="block pl-8 pr-4 py-3 text-sm text-header-fg hover:bg-white/10 transition-colors"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3.5 hover:bg-white/10 transition-colors text-header-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </>
  )
}
