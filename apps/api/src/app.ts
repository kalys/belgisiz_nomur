import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { prisma } from './db.js'
import { redis } from './redis.js'
import { numberRoutes } from './routes/numbers.js'
import { voteRoutes } from './routes/votes.js'
import { searchRoutes } from './routes/search.js'
import { statsRoutes } from './routes/stats.js'

export async function buildApp(opts: { rateLimit: boolean } = { rateLimit: true }): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? true,
  })

  app.get('/health', async () => {
    const [db, red] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
    ])
    return {
      status: 'ok',
      db: db.status === 'fulfilled' ? 'ok' : 'error',
      redis: red.status === 'fulfilled' ? 'ok' : 'error',
    }
  })

  if (opts.rateLimit) {
    await app.register(rateLimit, {
      global: true,
      max: 60,
      timeWindow: '1 minute',
      redis,
      keyGenerator: (req) => req.ip,
      errorResponseBuilder: () => ({ error: 'Too many requests', retryAfter: 60 }),
    })
  }

  await app.register(numberRoutes)
  await app.register(voteRoutes)
  await app.register(searchRoutes)
  await app.register(statsRoutes)

  return app
}
