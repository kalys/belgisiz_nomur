'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Report } from '@/lib/api'
import { api } from '@/lib/api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ReportCard({ report }: { report: Report }) {
  const t = useTranslations()
  const [voted, setVoted] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(report.helpful_count)

  async function handleVote(helpful: boolean) {
    if (voted) return
    try {
      await api.vote(report.id, helpful)
      if (helpful) setHelpfulCount((c) => c + 1)
      setVoted(true)
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {t(`report.categories.${report.category}`)}
          </span>
          {report.comment && (
            <p className="mt-2 text-sm text-gray-700">{report.comment}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">{formatDate(report.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voted}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              {t('vote.helpful')}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voted}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              {t('vote.notHelpful')}
            </button>
          </div>
          {helpfulCount > 0 && (
            <span className="text-xs text-gray-400">
              {t('vote.votes', { count: helpfulCount })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
