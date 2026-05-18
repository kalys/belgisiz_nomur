import Fastify from 'fastify'
import { prisma } from './db.js'
import { redis } from './redis.js'

const app = Fastify({ logger: true })

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

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
