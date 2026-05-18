import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { computeScore } from '../lib/score.js'

export async function searchRoutes(app: FastifyInstance) {
  // GET /search?q=...
  app.get<{ Querystring: { q?: string; limit?: string } }>('/search', async (req, reply) => {
    const { q, limit: limitStr } = req.query
    if (!q || q.trim().length < 3) {
      return reply.code(400).send({ error: 'q must be at least 3 characters' })
    }

    const limit = Math.min(20, Math.max(1, parseInt(limitStr ?? '10')))
    // Strip non-digits and leading zeros so "0700" matches "+996700..."
    const digits = q.replace(/\D/g, '').replace(/^0+/, '')

    const numbers = await prisma.number.findMany({
      where: { e164: { contains: digits } },
      take: limit,
      include: { reports: { select: { category: true, createdAt: true } } },
    })

    return numbers.map((n) => ({
      e164: n.e164,
      score: computeScore(n.reports),
    }))
  })
}
