'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: t('home') },
    { href: '/top-scammers', label: t('topScammers') },
    { href: '/categories', label: t('categories') },
    { href: '/about', label: t('about') },
    { href: '/faq', label: t('faq') },
  ]

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Белгисиз Номур
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm ${pathname === href ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="p-2 text-gray-600 hover:text-gray-900 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <nav className="border-t border-gray-100 px-4 pb-3 sm:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm ${pathname === href ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
