import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { SearchBar } from '@/components/SearchBar'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  return { title: t('name'), description: t('tagline') }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const tSite = await getTranslations({ locale, namespace: 'site' })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://belgisiznomer.kg'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: tSite('name'),
    description: tSite('tagline'),
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  let stats = { total_numbers: 0, total_reports: 0, total_votes: 0 }
  try {
    stats = await api.stats()
  } catch {
    // API may not be running in dev
  }

  return (
    <div className="flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold tracking-tight">{t('heroTitle')}</h1>
      <p className="mt-3 text-center text-gray-500">{t('heroSubtitle')}</p>
      <div className="mt-8 w-full max-w-xl">
        <SearchBar />
      </div>
      <div className="mt-8 grid w-full max-w-xl grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: t('totalNumbers'), value: stats.total_numbers },
          { label: t('totalReports'), value: stats.total_reports },
          { label: t('totalVotes'), value: stats.total_votes },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm sm:p-4"
          >
            <div className="text-2xl font-bold text-blue-600">{value.toLocaleString()}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/top-scammers" className="text-sm font-medium text-blue-600 hover:underline">
          {t('viewTopScammers')} →
        </Link>
      </div>
    </div>
  )
}
