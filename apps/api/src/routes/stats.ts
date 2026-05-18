import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'

export async function statsRoutes(app: FastifyInstance) {
  // GET /stats
  app.get('/stats', async () => {
    const [total_numbers, total_reports, total_votes, categoryBreakdown] = await Promise.all([
      prisma.number.count(),
      prisma.report.count(),
      prisma.vote.count(),
      prisma.report.groupBy({ by: ['category'], _count: { category: true } }),
    ])

    return {
      total_numbers,
      total_reports,
      total_votes,
      category_breakdown: Object.fromEntries(
        categoryBreakdown.map((r: (typeof categoryBreakdown)[number]) => [r.category, r._count.category])
      ),
    }
  })
}
