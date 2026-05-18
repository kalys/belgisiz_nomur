import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title') }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-700 leading-relaxed">{t('body')}</p>
      </div>
    </div>
  )
}
