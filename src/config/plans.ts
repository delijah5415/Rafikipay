/**
 * Subscription plans and tax configuration.
 *
 * Single source of truth for pricing across the app (marketing pages,
 * checkout, billing). All amounts are stored in cents to avoid
 * floating-point rounding issues.
 *
 * Every payment incurs a flat tax on top of the plan price:
 *   total = planPrice + round(planPrice * TAX_RATE)
 */

export type PlanId = 'free' | 'pro' | 'premium' | 'group';

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in cents. */
  priceCents: number;
  /** Human-readable price, e.g. "$20". */
  priceLabel: string;
  description: string;
  features: string[];
  /** Highlighted as the recommended plan on the pricing page. */
  featured?: boolean;
}

/** Flat tax rate applied to every payment (2%). */
export const TAX_RATE = 0.02;

/** TAX_RATE expressed as a percentage, for display and Stripe line items. */
export const TAX_PERCENT = TAX_RATE * 100;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    priceLabel: '$0',
    description: 'Get started with core payment tracking.',
    features: [
      'Up to 50 transactions / month',
      'M-Pesa, PayPal & bank tracking',
      'Basic dashboard',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 2000,
    priceLabel: '$20',
    description: 'For growing individuals and freelancers.',
    features: [
      'Unlimited transactions',
      'Recurring billing',
      'Email support',
    ],
    featured: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceCents: 3500,
    priceLabel: '$35',
    description: 'For merchants who need advanced tooling.',
    features: [
      'Everything in Pro',
      'Merchant dashboard & payouts',
      'Priority support',
    ],
  },
  group: {
    id: 'group',
    name: 'Group',
    priceCents: 6500,
    priceLabel: '$65',
    description: 'For teams and organizations.',
    features: [
      'Everything in Premium',
      'Multiple team members',
      'Dedicated account manager',
    ],
  },
};

export const PLAN_LIST: Plan[] = Object.values(PLANS);

/** Plan price in cents, or 0 for unknown plans. */
export function getPlanPriceCents(plan: string): number {
  return PLANS[plan as PlanId]?.priceCents ?? 0;
}

/** Tax on an amount (in cents), rounded to the nearest cent. */
export function computeTax(amountCents: number): number {
  return Math.round(amountCents * TAX_RATE);
}

/**
 * Full price breakdown for a plan and quantity, all in cents.
 */
export function priceBreakdown(plan: string, quantity: number = 1) {
  const subtotal = getPlanPriceCents(plan) * quantity;
  const tax = computeTax(subtotal);
  return { subtotal, tax, total: subtotal + tax };
}
