'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LABELS: Record<string, string> = { ky: 'KY', ru: 'RU', en: 'EN' }

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
            l === locale
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {LABELS[l] ?? l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
