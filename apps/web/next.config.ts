import path from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  // Required for standalone output to trace deps from the monorepo root
  outputFileTracingRoot: path.join(__dirname, '../..'),
}

export default withNextIntl(nextConfig)
