import { PayPalService, paypalService } from '../paypal.service';

describe('PayPalService', () => {
  let service: PayPalService;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new PayPalService();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('exports a shared singleton instance', () => {
    expect(paypalService).toBeInstanceOf(PayPalService);
  });

  it('createOrder returns a created placeholder order', async () => {
    await expect(
      service.createOrder({
        amount: 100,
        currency: 'USD',
        description: 'Test',
        returnUrl: 'https://app/return',
        cancelUrl: 'https://app/cancel',
      })
    ).resolves.toEqual({
      id: 'placeholder',
      status: 'CREATED',
      approvalUrl: 'https://paypal.com/approve',
    });
  });

  it('capturePayment returns a completed status', async () => {
    await expect(service.capturePayment('order-1')).resolves.toEqual({
      status: 'COMPLETED',
    });
  });

  it('refund returns success', async () => {
    await expect(service.refund('capture-1', 50)).resolves.toEqual({
      status: 'success',
    });
  });

  it('handleWebhook resolves without throwing', async () => {
    await expect(service.handleWebhook({})).resolves.toBeUndefined();
  });

  it('queryPaymentStatus returns a pending status', async () => {
    await expect(service.queryPaymentStatus('order-1')).resolves.toEqual({
      status: 'pending',
    });
  });
});
