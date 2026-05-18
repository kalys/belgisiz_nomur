import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Navbar } from '@/components/Navbar'
import '../globals.css'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!(routing.locales as readonly string[]).includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
