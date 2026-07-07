import { NextResponse } from 'next/server'
import { createCheckoutSession } from '../../../../services/stripe.service'

export async function POST(req: Request) {
  const body = await req.json()
  const { plan = 'pro', quantity = 1, email } = body
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const session = await createCheckoutSession({ plan, quantity, customerEmail: email })
  return NextResponse.json({ sessionId: session.id })
}
