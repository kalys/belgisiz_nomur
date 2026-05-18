import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { computeScore } from '../lib/score.js'

export async function topScammersRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { limit?: string } }>('/top-scammers', async (req) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20')))

    const numbers = await prisma.number.findMany({
      take: limit,
      orderBy: { reports: { _count: 'desc' } },
      include: { reports: { select: { category: true, createdAt: true } } },
    })

    return {
      data: numbers.map((n: (typeof numbers)[number]) => ({
        e164: n.e164,
        carrier: null,
        country_code: n.countryCode,
        score: computeScore(n.reports),
        created_at: n.createdAt.toISOString(),
      })),
    }
  })
}
