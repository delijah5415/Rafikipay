import { MpesaService, mpesaService } from '../mpesa.service';

describe('MpesaService', () => {
  let service: MpesaService;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new MpesaService();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('exports a shared singleton instance', () => {
    expect(mpesaService).toBeInstanceOf(MpesaService);
  });

  it('initiatePayment returns a success placeholder response', async () => {
    const res = await service.initiatePayment({
      phoneNumber: '254700000000',
      amount: 100,
      reference: 'ref-1',
      description: 'Test',
    });

    expect(res).toEqual({
      checkoutRequestId: 'placeholder',
      responseCode: '0',
      responseDescription: 'Success',
      customerMessage: 'Payment initiated',
    });
  });

  it('queryPaymentStatus returns a pending status', async () => {
    await expect(service.queryPaymentStatus('req-1')).resolves.toEqual({
      status: 'pending',
    });
  });

  it('handleCallback resolves without throwing', async () => {
    await expect(service.handleCallback({ Body: {} })).resolves.toBeUndefined();
  });

  it('verifyPayment resolves to true', async () => {
    await expect(service.verifyPayment('LGR7ABC')).resolves.toBe(true);
  });
});
