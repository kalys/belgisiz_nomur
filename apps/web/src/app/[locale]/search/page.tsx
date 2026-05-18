import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { SearchBar } from '@/components/SearchBar'
import { ScoreBadge } from '@/components/ScoreBadge'
import { api } from '@/lib/api'
import { normalizePhone } from '@belgisiz-nomur/phone-utils'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'search' })
  return { title: t('title') }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q = '' } = await searchParams
  const t = await getTranslations({ locale, namespace: 'search' })
  const tNumber = await getTranslations({ locale, namespace: 'number' })

  let results: Awaited<ReturnType<typeof api.search>> = { data: [] }
  if (q.trim()) {
    try {
      results = await api.search(q.trim())
    } catch {
      // empty
    }
  }

  // If no results but the query looks like a valid KG number, offer a direct link
  const normalized = results.data.length === 0 ? normalizePhone(q.trim()) : null

  return (
    <div>
      <div className="mb-6">
        <SearchBar initialValue={q} />
      </div>
      <h1 className="mb-4 text-xl font-semibold">{t('title')}</h1>
      {results.data.length === 0 ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
            <p>{t('noResults')}</p>
            <p className="mt-1 text-sm">{t('noResultsHint')}</p>
          </div>
          {normalized && (
            <Link
              href={`/number/${encodeURIComponent(normalized.e164)}`}
              className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm hover:border-blue-400"
            >
              <div>
                <span className="font-medium text-blue-800">{normalized.e164}</span>
                <span className="ml-2 text-sm text-blue-500">{tNumber('beFirst')}</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{tNumber('submitReport')} →</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.data.map((num) => (
            <Link
              key={num.e164}
              href={`/number/${encodeURIComponent(num.e164)}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-blue-300"
            >
              <div>
                <span className="font-medium">{num.e164}</span>
                {num.carrier && (
                  <span className="ml-2 text-sm text-gray-400">{num.carrier}</span>
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
