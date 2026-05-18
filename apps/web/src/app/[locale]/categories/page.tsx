import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { api, type Category } from '@/lib/api'

type Props = { params: Promise<{ locale: string }> }

const ALL_CATEGORIES: Category[] = [
  'scam',
  'spam',
  'telemarketer',
  'debt_collector',
  'legitimate',
  'unknown',
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'categories' })
  return { title: t('title') }
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'categories' })
  const tReport = await getTranslations({ locale, namespace: 'report' })

  let breakdown: Partial<Record<Category, number>> = {}
  try {
    const stats = await api.stats()
    breakdown = stats.category_breakdown
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">{t('title')}</h1>
      <p className="mb-6 text-gray-500">{t('subtitle')}</p>
      <div className="flex flex-col gap-3">
        {ALL_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-blue-300"
          >
            <span className="font-medium">{tReport(`categories.${cat}`)}</span>
            <span className="text-sm text-gray-400">
              {t('reportsCount', { count: breakdown[cat] ?? 0 })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
