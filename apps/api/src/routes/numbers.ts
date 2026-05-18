import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { normalizePhone } from '@belgisiz-nomur/phone-utils'
import { computeScore } from '../lib/score.js'
import { hashIp, hashAuthor } from '../lib/fingerprint.js'
import { ReportCategory } from '@prisma/client'

const VALID_CATEGORIES = Object.values(ReportCategory)

export async function numberRoutes(app: FastifyInstance) {
  // GET /numbers/:number — lookup + score
  app.get<{ Params: { number: string } }>('/numbers/:number', async (req, reply) => {
    const normalized = normalizePhone(req.params.number)
    if (!normalized) {
      return reply.code(400).send({ error: 'Invalid phone number' })
    }

    const number = await prisma.number.findUnique({
      where: { e164: normalized.e164 },
      include: { reports: { select: { category: true, createdAt: true } } },
    })

    if (!number) {
      return {
        e164: normalized.e164,
        carrier: null,
        country_code: normalized.countryCode,
        score: computeScore([]),
        created_at: null,
      }
    }

    return {
      e164: number.e164,
      carrier: null,
      country_code: number.countryCode,
      score: computeScore(number.reports),
      created_at: number.createdAt.toISOString(),
    }
  })

  // GET /numbers/:number/reports — paginated reports
  app.get<{
    Params: { number: string }
    Querystring: { page?: string; limit?: string }
  }>('/numbers/:number/reports', async (req, reply) => {
    const normalized = normalizePhone(req.params.number)
    if (!normalized) {
      return reply.code(400).send({ error: 'Invalid phone number' })
    }

    const page = Math.max(1, parseInt(req.query.page ?? '1'))
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20')))
    const skip = (page - 1) * limit

    const number = await prisma.number.findUnique({ where: { e164: normalized.e164 } })
    if (!number) {
      return { data: [], total: 0, page, limit }
    }

    const [reports, total] = await prisma.$transaction([
      prisma.report.findMany({
        where: { numberId: number.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          category: true,
          comment: true,
          createdAt: true,
          _count: { select: { votes: true } },
          votes: { select: { helpful: true } },
        },
      }),
      prisma.report.count({ where: { numberId: number.id } }),
    ])

    return {
      data: reports.map((r) => ({
        id: r.id,
        category: r.category,
        comment: r.comment,
        created_at: r.createdAt.toISOString(),
        vote_count: r._count.votes,
        helpful_count: r.votes.filter((v) => v.helpful).length,
      })),
      total,
      page,
      limit,
    }
  })

  // POST /numbers/:number/reports — submit a report (5 per 10 min per IP)
  app.post<{
    Params: { number: string }
    Body: { category: string; comment?: string }
  }>('/numbers/:number/reports', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, async (req, reply) => {
    const normalized = normalizePhone(req.params.number)
    if (!normalized) {
      return reply.code(400).send({ error: 'Invalid phone number' })
    }

    const { category, comment } = req.body ?? {}
    if (!category || !VALID_CATEGORIES.includes(category as ReportCategory)) {
      return reply.code(400).send({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` })
    }

    const ipHash = hashIp(req.ip)
    const authorHash = hashAuthor(req.ip, req.headers['user-agent'] ?? '')

    const number = await prisma.number.upsert({
      where: { e164: normalized.e164 },
      create: { e164: normalized.e164, countryCode: normalized.countryCode },
      update: {},
    })

    const report = await prisma.report.create({
      data: {
        numberId: number.id,
        category: category as ReportCategory,
        comment: comment?.trim() || null,
        authorHash,
        ipHash,
      },
      select: { id: true, category: true, comment: true, createdAt: true },
    })

    return reply.code(201).send({
      id: report.id,
      category: report.category,
      comment: report.comment,
      created_at: report.createdAt.toISOString(),
      vote_count: 0,
      helpful_count: 0,
    })
  })
}
