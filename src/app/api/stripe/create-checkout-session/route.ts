import { NextResponse } from 'next/server'
import { createCheckoutSession } from '../../../../services/stripe.service'

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { plan = 'pro', quantity = 1, email } = body ?? {}
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  try {
    const session = await createCheckoutSession({ plan, quantity, customerEmail: email })
    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Failed to create checkout session:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 })
  }
}
