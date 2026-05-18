import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { computeScore } from '../lib/score.js'
import { ReportCategory } from '@prisma/client'

const VALID_CATEGORIES = Object.values(ReportCategory)

export async function categoryRoutes(app: FastifyInstance) {
  app.get<{ Params: { category: string }; Querystring: { limit?: string } }>(
    '/categories/:category',
    async (req, reply) => {
      const { category } = req.params
      if (!VALID_CATEGORIES.includes(category as ReportCategory)) {
        return reply.code(400).send({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` })
      }

      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '20')))

      const numbers = await prisma.number.findMany({
        where: { reports: { some: { category: category as ReportCategory } } },
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
    },
  )
}
