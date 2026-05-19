import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('../db.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    number: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    report: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('../redis.js', () => ({
  redis: { ping: vi.fn().mockResolvedValue('PONG'), on: vi.fn() },
}))

import { prisma } from '../db.js'

const mockPrisma = prisma as unknown as {
  number: { findUnique: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> }
  report: { findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> }
  $transaction: ReturnType<typeof vi.fn>
}

describe('GET /numbers/:number', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('returns score for a known number', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findUnique.mockResolvedValue({
        id: '1',
        e164: '+996700123456',
        countryCode: '996',
        createdAt: new Date('2026-01-01'),
        reports: [{ category: 'scam', createdAt: new Date() }],
      })

      const res = await app.inject({ method: 'GET', url: '/numbers/0700123456' })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.e164).toBe('+996700123456')
      expect(body.score.report_count).toBe(1)
      expect(body.score.spam_ratio).toBe(1)
    })

    it('returns empty score for unknown number', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findUnique.mockResolvedValue(null)

      const res = await app.inject({ method: 'GET', url: '/numbers/0700123456' })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.e164).toBe('+996700123456')
      expect(body.score.report_count).toBe(0)
      expect(body.score.confidence).toBe('low')
    })
  })

  describe('edge cases', () => {
    it('returns 400 for invalid phone number', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({ method: 'GET', url: '/numbers/123' })

      expect(res.statusCode).toBe(400)
      expect(res.json().error).toBe('Invalid phone number')
    })
  })
})

describe('GET /numbers/:number/reports', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('returns paginated reports', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findUnique.mockResolvedValue({ id: '1', e164: '+996700123456' })
      mockPrisma.$transaction.mockResolvedValue([
        [{ id: 'r1', category: 'scam', comment: 'Test', createdAt: new Date(), _count: { votes: 2 }, votes: [{ helpful: true }, { helpful: false }] }],
        1,
      ])

      const res = await app.inject({ method: 'GET', url: '/numbers/0700123456/reports' })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.total).toBe(1)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].category).toBe('scam')
    })
  })

  describe('edge cases', () => {
    it('returns empty list for unknown number', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.findUnique.mockResolvedValue(null)

      const res = await app.inject({ method: 'GET', url: '/numbers/0700123456/reports' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toEqual({ data: [], total: 0, page: 1, limit: 20 })
    })

    it('returns 400 for invalid phone number', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({ method: 'GET', url: '/numbers/abc/reports' })

      expect(res.statusCode).toBe(400)
    })
  })
})

describe('POST /numbers/:number/reports', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('happy path', () => {
    it('creates a report and returns 201', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.upsert.mockResolvedValue({ id: '1', e164: '+996700123456' })
      mockPrisma.report.create.mockResolvedValue({
        id: 'r1',
        category: 'scam',
        comment: 'Банктан деп чалды',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/numbers/0700123456/reports',
        payload: { category: 'scam', comment: 'Банктан деп чалды' },
      })

      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.category).toBe('scam')
      expect(body.comment).toBe('Банктан деп чалды')
    })

    it('creates a report without a comment', async () => {
      const app = await buildApp({ rateLimit: false })
      mockPrisma.number.upsert.mockResolvedValue({ id: '1', e164: '+996700123456' })
      mockPrisma.report.create.mockResolvedValue({
        id: 'r1',
        category: 'spam',
        comment: null,
        createdAt: new Date(),
      })

      const res = await app.inject({
        method: 'POST',
        url: '/numbers/0700123456/reports',
        payload: { category: 'spam' },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json().comment).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('returns 400 for invalid phone number', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({
        method: 'POST',
        url: '/numbers/123/reports',
        payload: { category: 'scam' },
      })

      expect(res.statusCode).toBe(400)
      expect(res.json().error).toBe('Invalid phone number')
    })

    it('returns 400 for invalid category', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({
        method: 'POST',
        url: '/numbers/0700123456/reports',
        payload: { category: 'not-a-category' },
      })

      expect(res.statusCode).toBe(400)
      expect(res.json().error).toContain('category must be one of')
    })

    it('returns 400 when category is missing', async () => {
      const app = await buildApp({ rateLimit: false })

      const res = await app.inject({
        method: 'POST',
        url: '/numbers/0700123456/reports',
        payload: {},
      })

      expect(res.statusCode).toBe(400)
    })
  })
})
