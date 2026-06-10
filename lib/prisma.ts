import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const logOptions: Prisma.LogDefinition[] = [{ emit: 'stdout', level: 'error' }]

const clientOptions = {
  log: process.env.NODE_ENV === 'development' ? logOptions : undefined,
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(clientOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}