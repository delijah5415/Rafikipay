import { NextResponse } from 'next/server'
import { handleStripeEvent, WebhookSignatureError } from '../../../../services/stripe.service'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature') || ''
  const raw = await req.text()
  const buf = Buffer.from(raw)

  try {
    await handleStripeEvent(buf, signature)
    return NextResponse.json({ received: true })
  } catch (err) {
    // Signature failures are the caller's fault: reject with 400 so Stripe does
    // not retry, and avoid leaking internal details.
    if (err instanceof WebhookSignatureError) {
      console.error('Stripe webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Processing failures (e.g. database errors) are transient on our side:
    // respond with 500 so Stripe retries delivery instead of dropping the event.
    console.error('Stripe webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
