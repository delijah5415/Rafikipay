import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '../../../../services/stripe.service';
import { PLANS, PlanId } from '../../../../config/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Checkout initialization route.
 *
 * Creates a Stripe Checkout session for the requested plan. Tax (a flat
 * 2%) is added as a separate line item inside the service.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, quantity = 1, customerEmail, mode = 'subscription' } = body ?? {};

    if (!customerEmail) {
      return NextResponse.json({ error: 'customerEmail is required' }, { status: 400 });
    }
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        { error: `Unknown plan. Valid plans: ${Object.keys(PLANS).join(', ')}` },
        { status: 400 }
      );
    }
    if (plan === ('free' as PlanId)) {
      return NextResponse.json(
        { error: 'The free plan does not require checkout' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession({ plan, quantity, customerEmail, mode });
    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
