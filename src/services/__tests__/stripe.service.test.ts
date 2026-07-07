// Configure env before the service module is loaded, since TAX_PERCENT and the
// Stripe client are initialized at import time.
process.env.TAX_PERCENT = '10';
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
    it('applies TAX_PERCENT and rounds to the nearest cent', () => {
      // 10% of 2400 = 240
      expect(computeTax(2400)).toBe(240);
      // 10% of 1005 = 100.5 -> rounds to 101
      expect(computeTax(1005)).toBe(101);
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

      // subtotal = 1200 * 2 = 2400, tax = 240
      const createArg = mockSessionsCreate.mock.calls[0][0];
      expect(createArg.mode).toBe('subscription');
      expect(createArg.customer_email).toBe('user@example.com');
      expect(createArg.line_items[0].price_data.unit_amount).toBe(2400);
      expect(createArg.line_items[0].quantity).toBe(2);
      expect(createArg.line_items[1].price_data.unit_amount).toBe(240);

      // total = 2640 cents -> 26.4, tax 240 cents -> 2.4
      const paymentArg = mockPaymentCreate.mock.calls[0][0];
      expect(paymentArg.data.amount).toBeCloseTo(26.4);
      expect(paymentArg.data.taxAmount).toBeCloseTo(2.4);
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
