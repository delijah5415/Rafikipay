import { PrismaClient } from '@prisma/client'

/**
 * Shared PrismaClient singleton.
 *
 * A single instance is reused across the application (and across hot reloads in
 * development) to avoid exhausting the database connection pool. This is the
 * canonical client — import it from here rather than instantiating PrismaClient
 * directly.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export { prisma }
export default prisma
