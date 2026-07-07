import { NextResponse } from 'next/server'
import { handleStripeEvent } from '../../../../services/stripe.service'
import { errorResponse } from '../../../../lib/api-response'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature') || ''
  const raw = await req.text()
  const buf = Buffer.from(raw)
  try {
    await handleStripeEvent(buf, signature)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error', err.message)
    return errorResponse(err.message, 400)
  }
}
