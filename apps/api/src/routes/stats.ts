import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'

export async function statsRoutes(app: FastifyInstance) {
  // GET /stats
  app.get('/stats', async () => {
    const [totalNumbers, totalReports, categoryBreakdown] = await Promise.all([
      prisma.number.count(),
      prisma.report.count(),
      prisma.report.groupBy({ by: ['category'], _count: { category: true } }),
    ])

    return {
      totalNumbers,
      totalReports,
      categoryBreakdown: Object.fromEntries(
        categoryBreakdown.map((r) => [r.category, r._count.category])
      ),
    }
  })
}
