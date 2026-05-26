'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search Records' },
  { href: '/map', label: 'Map' },
  { href: '/advisory-board', label: 'Advisory Board' },
  { href: '/about', label: 'About' },
]

export default function NavMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav aria-label="Main navigation" className="hidden sm:block">
        <ul className="flex gap-4 sm:gap-6 list-none m-0 p-0 text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:opacity-75 transition-opacity whitespace-nowrap">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="sm:hidden text-2xl leading-none text-header-fg bg-transparent border-0 cursor-pointer px-1 py-0.5"
      >
        <span aria-hidden="true">{open ? '×' : '☰'}</span>
      </button>

      {/* Mobile dropdown — positioned relative to the header via the parent's relative */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main navigation"
          className="sm:hidden absolute left-0 right-0 top-full bg-header-bg border-t border-white/10 shadow-lg z-50"
        >
          <ul className="list-none m-0 p-0 text-sm divide-y divide-white/10">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3.5 hover:bg-white/10 transition-colors text-header-fg"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
