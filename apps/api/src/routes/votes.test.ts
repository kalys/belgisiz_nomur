import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('../db.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    report: { findUnique: vi.fn() },
    vote: { upsert: vi.fn() },
  },
}))

vi.mock('../redis.js', () => ({
  redis: { ping: vi.fn().mockResolvedValue('PONG'), on: vi.fn() },
}))

import { prisma } from '../db.js'

const mockPrisma = prisma as unknown as {
  report: { findUnique: ReturnType<typeof vi.fn> }
  vote: { upsert: ReturnType<typeof vi.fn> }
}

describe('POST /reports/:id/vote', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('creates a helpful vote', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.report.findUnique.mockResolvedValue({ id: 'r1' })
      mockPrisma.vote.upsert.mockResolvedValue({
        id: 'v1',
        helpful: true,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/reports/r1/vote',
        payload: { helpful: true },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().helpful).toBe(true)
    })

    it('creates a not-helpful vote', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.report.findUnique.mockResolvedValue({ id: 'r1' })
      mockPrisma.vote.upsert.mockResolvedValue({
        id: 'v1',
        helpful: false,
        createdAt: new Date(),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/reports/r1/vote',
        payload: { helpful: false },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().helpful).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('returns 404 when report does not exist', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.report.findUnique.mockResolvedValue(null)

      const res = await app.inject({
        method: 'POST',
        url: '/reports/nonexistent/vote',
        payload: { helpful: true },
      })

      expect(res.statusCode).toBe(404)
      expect(res.json().error).toBe('Report not found')
    })

    it('returns 400 when helpful is not a boolean', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({
        method: 'POST',
        url: '/reports/r1/vote',
        payload: { helpful: 'yes' },
      })

      expect(res.statusCode).toBe(400)
      expect(res.json().error).toBe('helpful must be a boolean')
    })

    it('returns 400 when body is missing', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({
        method: 'POST',
        url: '/reports/r1/vote',
        payload: {},
      })

      expect(res.statusCode).toBe(400)
    })
  })
})
