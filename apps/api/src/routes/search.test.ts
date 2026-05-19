import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('../db.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    number: { findMany: vi.fn() },
  },
}))

vi.mock('../redis.js', () => ({
  redis: { ping: vi.fn().mockResolvedValue('PONG'), on: vi.fn() },
}))

import { prisma } from '../db.js'

const mockPrisma = prisma as unknown as {
  number: { findMany: ReturnType<typeof vi.fn> }
}

describe('GET /search', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('returns matching numbers with scores', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findMany.mockResolvedValue([
        {
          e164: '+996700123456',
          countryCode: '996',
          createdAt: new Date('2026-01-01'),
          reports: [
            { category: 'scam', createdAt: new Date() },
            { category: 'scam', createdAt: new Date() },
          ],
        },
      ])

      const res = await app.inject({ method: 'GET', url: '/search?q=0700' })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data).toHaveLength(1)
      expect(body.data[0].e164).toBe('+996700123456')
      expect(body.data[0].score.report_count).toBe(2)
      expect(body.data[0].score.spam_ratio).toBe(1)
    })

    it('returns empty data array when no numbers match', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findMany.mockResolvedValue([])

      const res = await app.inject({ method: 'GET', url: '/search?q=0999' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual({ data: [] })
    })
  })

  describe('edge cases', () => {
    it('returns 400 when query is too short', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({ method: 'GET', url: '/search?q=07' })

      expect(res.statusCode).toBe(400)
      expect(res.json().error).toBe('q must be at least 3 characters')
    })

    it('returns 400 when query is missing', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({ method: 'GET', url: '/search' })

      expect(res.statusCode).toBe(400)
    })
  })
})
