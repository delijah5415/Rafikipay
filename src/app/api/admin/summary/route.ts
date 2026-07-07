import prisma from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const totals = await prisma.payment.groupBy({ by: ['status'], _sum: { amount: true } })
  return new Response(JSON.stringify({ totals }), { status: 200 })
}
