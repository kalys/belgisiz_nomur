import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('../db.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    number: { count: vi.fn() },
    report: { count: vi.fn(), groupBy: vi.fn() },
  },
}))

vi.mock('../redis.js', () => ({
  redis: { ping: vi.fn().mockResolvedValue('PONG'), on: vi.fn() },
}))

import { prisma } from '../db.js'

const mockPrisma = prisma as unknown as {
  number: { count: ReturnType<typeof vi.fn> }
  report: { count: ReturnType<typeof vi.fn>; groupBy: ReturnType<typeof vi.fn> }
}

describe('GET /stats', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('returns total counts and category breakdown', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.count.mockResolvedValue(42)
      mockPrisma.report.count.mockResolvedValue(130)
      mockPrisma.report.groupBy.mockResolvedValue([
        { category: 'scam', _count: { category: 95 } },
        { category: 'spam', _count: { category: 35 } },
      ])

      const res = await app.inject({ method: 'GET', url: '/stats' })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.totalNumbers).toBe(42)
      expect(body.totalReports).toBe(130)
      expect(body.categoryBreakdown).toEqual({ scam: 95, spam: 35 })
    })

    it('returns zeros when database is empty', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.count.mockResolvedValue(0)
      mockPrisma.report.count.mockResolvedValue(0)
      mockPrisma.report.groupBy.mockResolvedValue([])

      const res = await app.inject({ method: 'GET', url: '/stats' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual({ totalNumbers: 0, totalReports: 0, categoryBreakdown: {} })
    })
  })
})
