// Configure env before the service module is loaded, since the Stripe client
// is initialized at import time. Tax is a flat 2% from src/config/plans.
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

const mockSessionsCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockSessionsCreate } },
    webhooks: { constructEvent: mockConstructEvent },
  }));
});

const mockPaymentCreate = jest.fn();
const mockPaymentUpdateMany = jest.fn();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    payment: {
      create: (...args: any[]) => mockPaymentCreate(...args),
      updateMany: (...args: any[]) => mockPaymentUpdateMany(...args),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  computeTax,
  createCheckoutSession,
  handleStripeEvent,
} = require('../stripe.service');

describe('stripe.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionsCreate.mockResolvedValue({ id: 'cs_test_1' });
    mockPaymentCreate.mockResolvedValue({});
    mockPaymentUpdateMany.mockResolvedValue({ count: 1 });
  });

  describe('computeTax', () => {
    it('applies a flat 2% tax and rounds to the nearest cent', () => {
      // 2% of 2000 = 40
      expect(computeTax(2000)).toBe(40);
      // 2% of 1025 = 20.5 -> rounds to 21
      expect(computeTax(1025)).toBe(21);
      expect(computeTax(0)).toBe(0);
    });
  });

  describe('createCheckoutSession', () => {
    it('builds line items with subtotal + tax and records a pending payment', async () => {
      const session = await createCheckoutSession({
        plan: 'pro',
        quantity: 2,
        customerEmail: 'user@example.com',
      });

      expect(session).toEqual({ id: 'cs_test_1' });

      // pro = 2000, subtotal = 2000 * 2 = 4000, tax = 2% = 80
      const createArg = mockSessionsCreate.mock.calls[0][0];
      expect(createArg.mode).toBe('subscription');
      expect(createArg.customer_email).toBe('user@example.com');
      // subtotal already accounts for quantity, so the plan line item is qty 1
      expect(createArg.line_items[0].price_data.unit_amount).toBe(4000);
      expect(createArg.line_items[0].quantity).toBe(1);
      expect(createArg.line_items[1].price_data.unit_amount).toBe(80);

      // total = 4080 cents -> 40.8, tax 80 cents -> 0.8
      const paymentArg = mockPaymentCreate.mock.calls[0][0];
      expect(paymentArg.data.amount).toBeCloseTo(40.8);
      expect(paymentArg.data.taxAmount).toBeCloseTo(0.8);
      expect(paymentArg.data.currency).toBe('USD');
      expect(paymentArg.data.status).toBe('pending');
      expect(paymentArg.data.provider).toBe('stripe');
      expect(paymentArg.data.providerRef).toBe('cs_test_1');
    });

    it('uses payment mode when mode is not subscription', async () => {
      await createCheckoutSession({
        plan: 'free',
        customerEmail: 'user@example.com',
        mode: 'payment',
      });

      expect(mockSessionsCreate.mock.calls[0][0].mode).toBe('payment');
    });

    it('still returns the session if the DB write fails', async () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockPaymentCreate.mockRejectedValueOnce(new Error('db down'));

      const session = await createCheckoutSession({
        plan: 'business',
        customerEmail: 'user@example.com',
      });

      expect(session).toEqual({ id: 'cs_test_1' });
      errorSpy.mockRestore();
    });
  });

  describe('handleStripeEvent', () => {
    it('marks the payment completed on checkout.session.completed', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_1' } },
      });

      const result = await handleStripeEvent(Buffer.from('{}'), 'sig');

      expect(result).toEqual({ received: true });
      expect(mockPaymentUpdateMany).toHaveBeenCalledWith({
        where: { providerRef: 'cs_test_1' },
        data: { status: 'completed' },
      });
    });

    it('ignores unrelated event types', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'payment_intent.created',
        data: { object: {} },
      });

      const result = await handleStripeEvent(Buffer.from('{}'), 'sig');

      expect(result).toEqual({ received: true });
      expect(mockPaymentUpdateMany).not.toHaveBeenCalled();
    });

    it('throws when signature verification fails', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        handleStripeEvent(Buffer.from('{}'), 'bad-sig')
      ).rejects.toThrow('Invalid signature');
    });
  });
});
