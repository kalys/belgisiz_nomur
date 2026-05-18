'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export function Navbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()

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
        <nav className="flex items-center gap-4">
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
      </div>
    </header>
  )
}
