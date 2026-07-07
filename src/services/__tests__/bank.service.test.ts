import { BankService, bankService } from '../bank.service';

const transferRequest = {
  bankCode: '001',
  accountNumber: '0123456789',
  accountName: 'Jane Doe',
  amount: 500,
  reference: 'ref-1',
  description: 'Payout',
};

describe('BankService', () => {
  let service: BankService;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new BankService();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('exports a shared singleton instance', () => {
    expect(bankService).toBeInstanceOf(BankService);
  });

  it('initiateTransfer returns a pending placeholder response', async () => {
    await expect(service.initiateTransfer(transferRequest)).resolves.toEqual({
      transactionId: 'placeholder',
      status: 'PENDING',
      message: 'Transfer initiated',
    });
  });

  it('verifyAccount reports the account as valid (placeholder)', async () => {
    await expect(service.verifyAccount('001', '0123456789')).resolves.toEqual({
      valid: true,
    });
  });

  it('queryTransferStatus returns a pending status', async () => {
    await expect(service.queryTransferStatus('tx-1')).resolves.toEqual({
      status: 'PENDING',
    });
  });

  it('handleCallback resolves without throwing', async () => {
    await expect(service.handleCallback({})).resolves.toBeUndefined();
  });

  it('setupRecurring returns a recurring id placeholder', async () => {
    await expect(
      service.setupRecurring(transferRequest, 'monthly')
    ).resolves.toEqual({ recurringId: 'placeholder' });
  });

  it('reconcileStatement reports reconciled', async () => {
    await expect(service.reconcileStatement('2024-01')).resolves.toEqual({
      reconciled: true,
    });
  });
});
