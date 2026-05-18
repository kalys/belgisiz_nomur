import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  return { title: t('title') }
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      <div className="flex flex-col gap-4">
        {items.map(({ q, a }) => (
          <div key={q} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-gray-900">{q}</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
