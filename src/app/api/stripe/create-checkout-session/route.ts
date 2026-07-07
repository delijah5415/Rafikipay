import { NextResponse } from 'next/server'
import { createCheckoutSession } from '../../../../services/stripe.service'
import { errorResponse } from '../../../../lib/api-response'

export async function POST(req: Request) {
  const body = await req.json()
  const { plan = 'pro', quantity = 1, email } = body
  if (!email) return errorResponse('email required', 400)

  const session = await createCheckoutSession({ plan, quantity, customerEmail: email })
  return NextResponse.json({ sessionId: session.id })
}
