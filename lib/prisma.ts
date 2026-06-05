import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db'
}

const errorLogLevel: Array<'error'> = ['error']

const clientOptions = {
  log: process.env.NODE_ENV === 'development' ? errorLogLevel : undefined,
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient(clientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
