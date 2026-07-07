/**
 * Shared application types.
 */

export type { PlanId, Plan } from '../config/plans';

export type PaymentProvider = 'mpesa' | 'paypal' | 'bank' | 'stripe';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentSummary {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  taxAmount?: number;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface CheckoutRequest {
  plan: string;
  quantity?: number;
  customerEmail: string;
  mode?: 'subscription' | 'payment';
}
