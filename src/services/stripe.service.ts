import Stripe from 'stripe'
import prisma from '../lib/prisma'
import { computeTax, priceBreakdown, TAX_PERCENT } from '../config/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export { computeTax }

export async function createCheckoutSession({ plan, quantity = 1, customerEmail, mode = 'subscription', successUrl, cancelUrl }: any) {
  const { subtotal, tax, total } = priceBreakdown(plan, quantity)

  // Use Stripe Checkout session with line items (amount handled by Stripe via Prices in dashboard normally)
  const session = await stripe.checkout.sessions.create({
    mode: mode === 'subscription' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan} plan` },
          // subtotal already accounts for quantity
          unit_amount: subtotal,
        },
        quantity: 1,
      },
      // Add a separate line item for tax so customer sees breakdown
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Tax (${TAX_PERCENT}%)` },
          unit_amount: tax,
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cancel`,
  })

  // Create a pending Payment record in DB
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
    console.error('Prisma create payment error', err)
  }

  return session
}

export async function handleStripeEvent(rawBody: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    throw err
  }

  // handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    // Update payment record
    try {
      await prisma.payment.updateMany({
        where: { providerRef: session.id },
        data: { status: 'completed' },
      })
    } catch (err) {
      console.error('Prisma update payment error', err)
    }
  }

  return { received: true }
}
