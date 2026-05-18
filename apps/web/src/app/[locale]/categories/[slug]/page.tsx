import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { ScoreBadge } from '@/components/ScoreBadge'
import { api, type Category } from '@/lib/api'

const VALID_CATEGORIES: Category[] = [
  'scam',
  'spam',
  'telemarketer',
  'debt_collector',
  'legitimate',
  'unknown',
]

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'report' })
  return { title: t(`categories.${slug as Category}`) }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  if (!VALID_CATEGORIES.includes(slug as Category)) notFound()

  const category = slug as Category
  const t = await getTranslations({ locale, namespace: 'report' })
  const tCat = await getTranslations({ locale, namespace: 'categories' })

  let results = { data: [] as Awaited<ReturnType<typeof api.search>>['data'] }
  try {
    results = await api.search(`&category=${category}`)
  } catch {
    // empty
  }

  return (
    <div>
      <p className="mb-2 text-sm text-gray-400">{tCat('title')}</p>
      <h1 className="mb-6 text-2xl font-bold">{t(`categories.${category}`)}</h1>
      {results.data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
          —
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
