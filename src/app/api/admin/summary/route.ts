import prisma from '../../../../lib/prisma'

export async function GET() {
  try {
    const totals = await prisma.payment.groupBy({ by: ['status'], _sum: { amount: true } })
    return new Response(JSON.stringify({ totals }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('Failed to load admin summary:', err)
    return new Response(JSON.stringify({ error: 'Failed to load summary' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
