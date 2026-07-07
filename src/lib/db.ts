import prisma from './prisma'

/**
 * @deprecated Import the shared client from '@/lib/prisma' instead.
 *
 * Re-exported here for backwards compatibility. Both `db` and the default
 * export point at the single shared PrismaClient instance defined in
 * `./prisma` so the app only ever creates one client.
 */
export const db = prisma
export default prisma
