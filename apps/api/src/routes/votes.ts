import type { FastifyInstance } from 'fastify'
import { prisma } from '../db.js'
import { hashAuthor } from '../lib/fingerprint.js'

export async function voteRoutes(app: FastifyInstance) {
  // POST /reports/:id/vote
  app.post<{
    Params: { id: string }
    Body: { helpful: boolean }
  }>('/reports/:id/vote', async (req, reply) => {
    const { id } = req.params
    const { helpful } = req.body ?? {}

    if (typeof helpful !== 'boolean') {
      return reply.code(400).send({ error: 'helpful must be a boolean' })
    }

    const report = await prisma.report.findUnique({ where: { id } })
    if (!report) {
      return reply.code(404).send({ error: 'Report not found' })
    }

    const authorHash = hashAuthor(req.ip, req.headers['user-agent'] ?? '')

    const vote = await prisma.vote.upsert({
      where: { reportId_authorHash: { reportId: id, authorHash } },
      create: { reportId: id, helpful, authorHash },
      update: { helpful },
      select: { id: true, helpful: true, createdAt: true },
    })

    return vote
  })
}
