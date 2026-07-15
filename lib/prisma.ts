import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // This will log database queries to your terminal for easy debugging!
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma