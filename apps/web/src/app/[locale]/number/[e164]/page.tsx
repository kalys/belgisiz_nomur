import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { ScoreBadge } from '@/components/ScoreBadge'
import { ReportCard } from '@/components/ReportCard'
import { ReportForm } from '@/components/ReportForm'
import { api, type Score } from '@/lib/api'
import { submitReport } from './actions'

type Props = { params: Promise<{ locale: string; e164: string }> }

const EMPTY_SCORE: Score = { score: 0, confidence: 'low', report_count: 0, spam_ratio: 0 }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, e164 } = await params
  const number = decodeURIComponent(e164)
  const t = await getTranslations({ locale, namespace: 'number' })
  return { title: `${number} — ${t('title')}` }
}

export default async function NumberPage({ params }: Props) {
  const { locale, e164 } = await params
  const number = decodeURIComponent(e164)
  const t = await getTranslations({ locale, namespace: 'number' })

  // API returns { e164, score: null } for unknown numbers — treat as new number
  let e164Normalized = number
  let score: Score = EMPTY_SCORE
  let carrier: string | null = null
  try {
    const data = await api.getNumber(number)
    e164Normalized = data.e164
    score = data.score ?? EMPTY_SCORE
    carrier = data.carrier
  } catch {
    // If completely invalid number, still show the page with empty state
  }

  let reportsData: Awaited<ReturnType<typeof api.getReports>> = {
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  }
  try {
    reportsData = await api.getReports(number)
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{e164Normalized}</h1>
            {carrier && (
              <p className="mt-1 text-sm text-gray-500">
                {t('carrier')}: {carrier}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t('reportCount', { count: score.report_count })}
            </p>
          </div>
          <ScoreBadge score={score} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t('submitReport')}</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ReportForm number={e164Normalized} action={submitReport} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t('reportsTitle')}</h2>
        {reportsData.data.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
            <p>{t('noReports')}</p>
            <p className="mt-1 text-sm">{t('beFirst')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reportsData.data.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
