'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Category } from '@/lib/api'
import type { submitReport } from '@/app/[locale]/number/[e164]/actions'

const CATEGORIES: Category[] = [
  'scam',
  'spam',
  'telemarketer',
  'debt_collector',
  'legitimate',
  'unknown',
]

export function ReportForm({
  number,
  action,
}: {
  number: string
  action: typeof submitReport
}) {
  const t = useTranslations('report')
  const router = useRouter()
  const [category, setCategory] = useState<Category>('scam')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    const result = await action(number, category, comment)
    if (result.ok) {
      setStatus('success')
      setComment('')
      router.refresh()
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{t('success')}</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t('category')}</label>
        <select
          value={category}
          onChange={(e) => setCategory((e.target as HTMLSelectElement).value as Category)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`categories.${c}`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">{t('comment')}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment((e.target as HTMLTextAreaElement).value)}
          placeholder={t('commentPlaceholder')}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-600">{t('error')}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
