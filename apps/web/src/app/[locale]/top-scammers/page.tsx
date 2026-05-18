import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { ScoreBadge } from '@/components/ScoreBadge'
import { api } from '@/lib/api'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'topScammers' })
  return { title: t('title') }
}

export default async function TopScammersPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'topScammers' })

  let results = { data: [] as Awaited<ReturnType<typeof api.topScammers>>['data'] }
  try {
    results = await api.topScammers(50)
  } catch {
    // empty
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{t('title')}</h1>
      <p className="mb-6 text-gray-500">{t('subtitle')}</p>
      {results.data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
          —
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.data.map((num, i) => (
            <Link
              key={num.e164}
              href={`/number/${encodeURIComponent(num.e164)}`}
              className="flex min-w-0 items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-blue-300"
            >
              <span className="w-6 shrink-0 text-center text-sm font-semibold text-gray-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">{num.e164}</span>
                {num.carrier && (
                  <span className="block truncate text-sm text-gray-400">{num.carrier}</span>
                )}
              </div>
              <ScoreBadge score={num.score} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
