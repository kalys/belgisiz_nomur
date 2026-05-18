import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const url =
  process.env.DATABASE_URL ?? 'postgresql://belgisiz:belgisiz@localhost:5433/belgisiz_nomur'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
