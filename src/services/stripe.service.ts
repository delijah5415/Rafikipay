import Stripe from 'stripe'
import prisma from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-01' })
const TAX_PERCENT = Number(process.env.TAX_PERCENT || '2')

const PLAN_PRICE_CENTS: Record<string, number> = {
  free: 0,
  pro: 1200,
  business: 4900,
}

export function computeTax(amountCents: number) {
  return Math.round((amountCents * TAX_PERCENT) / 100)
}

export async function createCheckoutSession({ plan, quantity = 1, customerEmail, mode = 'subscription', successUrl, cancelUrl }: any) {
  const priceCents = PLAN_PRICE_CENTS[plan] ?? 0
  const subtotal = priceCents * quantity
  const tax = computeTax(subtotal)
  const total = subtotal + tax

  // Use Stripe Checkout session with line items (amount handled by Stripe via Prices in dashboard normally)
  const session = await stripe.checkout.sessions.create({
    mode: mode === 'subscription' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan} plan` },
          unit_amount: subtotal,
        },
        quantity,
      },
      // Add a separate line item for tax so customer sees breakdown
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Tax (${process.env.TAX_PERCENT || '2'}%)` },
          unit_amount: tax,
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cancel`,
  })

  // Create a pending Payment record in DB. If this fails we must surface it:
  // a Checkout session without a matching local record means the webhook that
  // fires on completion has nothing to reconcile against.
  try {
    await prisma.payment.create({
      data: {
        user: { connect: { email: customerEmail } },
        amount: Number((total / 100).toFixed(4)),
        currency: 'USD',
        status: 'pending',
        provider: 'stripe',
        providerRef: session.id,
        taxAmount: Number((tax / 100).toFixed(4)),
      },
    })
  } catch (err) {
    console.error('Failed to persist pending payment for session', session.id, err)
    throw new Error(
      `Failed to persist pending payment for Stripe session ${session.id}: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  return session
}

/**
 * Raised when the incoming webhook payload fails Stripe signature verification.
 * Lets callers respond with 400 (do not retry) rather than 500 (retry).
 */
export class WebhookSignatureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WebhookSignatureError'
  }
}

export async function handleStripeEvent(rawBody: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    throw new WebhookSignatureError(
      `Stripe signature verification failed: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  // handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    // Update payment record. Errors are propagated so the webhook responds with
    // a non-2xx status and Stripe retries delivery instead of dropping the event.
    const result = await prisma.payment.updateMany({
      where: { providerRef: session.id },
      data: { status: 'completed' },
    })

    if (result.count === 0) {
      console.warn('No pending payment found for completed Stripe session', session.id)
    }
  }

  return { received: true }
}
