import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * This ensures a single instance of PrismaClient is used across the application
 * Prevents exhausting database connection pool in development
 * 
 * Usage:
 * import { db } from '@/lib/db';
 * const user = await db.user.findUnique({ where: { id: 1 } });
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export default db;