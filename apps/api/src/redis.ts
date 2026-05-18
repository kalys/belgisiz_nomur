import Redis from 'ioredis'

const url = process.env.REDIS_URL ?? 'redis://localhost:6380'

export const redis = new Redis(url, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message)
})
