import type { MetadataRoute } from 'next'
import { api } from '@/lib/api'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://belgisiznomur.kg'
const LOCALES = ['ky', 'ru']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/top-scammers', '/about', '/faq']

  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({ url: `${BASE}/${locale}${route}`, changeFrequency: 'weekly', priority: 0.8 })
    }
  }

  try {
    const result = await api.search('')
    for (const num of result.data) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE}/${locale}/number/${encodeURIComponent(num.e164)}`,
          changeFrequency: 'daily',
          priority: 0.6,
        })
      }
    }
  } catch {
    // API unavailable at build time
  }

  return entries
}
