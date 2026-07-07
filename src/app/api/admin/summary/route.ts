import crypto from 'crypto'
import prisma from '../../../../lib/prisma'

/** Constant-time comparison of two strings. */
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export async function GET(request: Request) {
  // This endpoint exposes aggregated financial data and must be authenticated.
  // Fail closed if the admin secret is not configured.
  const adminSecret = process.env.ADMIN_API_SECRET
  if (!adminSecret) {
    console.error('ADMIN_API_SECRET is not configured; rejecting admin summary request')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const authHeader = request.headers.get('authorization') || ''
  if (!safeEqual(authHeader, `Bearer ${adminSecret}`)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const totals = await prisma.payment.groupBy({ by: ['status'], _sum: { amount: true } })
  return new Response(JSON.stringify({ totals }), { status: 200 })
}
