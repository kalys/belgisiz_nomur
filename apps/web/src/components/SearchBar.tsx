'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useState } from 'react'

export function SearchBar({ initialValue = '' }: { initialValue?: string }) {
  const t = useTranslations('search')
  const router = useRouter()
  const [value, setValue] = useState(initialValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue((e.target as HTMLInputElement).value)}
        placeholder={t('placeholder')}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t('button')}
      </button>
    </form>
  )
}
