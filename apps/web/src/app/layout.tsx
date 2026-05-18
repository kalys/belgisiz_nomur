import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Belgisiz Nomur',
  description: 'Kyrgyzstan phone number reputation service',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ky">
      <body>{children}</body>
    </html>
  )
}
