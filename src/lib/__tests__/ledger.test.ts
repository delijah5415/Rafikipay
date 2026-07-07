import {
  signedAmount,
  applyEntry,
  computeBalance,
  transferLines,
} from '../ledger';

describe('ledger', () => {
  describe('signedAmount', () => {
    it('credits are positive, debits are negative', () => {
      expect(signedAmount({ type: 'credit', amount: 500 })).toBe(500);
      expect(signedAmount({ type: 'debit', amount: 500 })).toBe(-500);
    });

    it('rejects non-positive or non-integer amounts', () => {
      expect(() => signedAmount({ type: 'credit', amount: 0 })).toThrow();
      expect(() => signedAmount({ type: 'credit', amount: -1 })).toThrow();
      expect(() => signedAmount({ type: 'credit', amount: 1.5 })).toThrow();
    });
  });

  describe('applyEntry', () => {
    it('applies credits and debits', () => {
      expect(applyEntry(1000, { type: 'credit', amount: 250 })).toBe(1250);
      expect(applyEntry(1000, { type: 'debit', amount: 250 })).toBe(750);
    });

    it('rejects overdrafts', () => {
      expect(() => applyEntry(100, { type: 'debit', amount: 250 })).toThrow(
        /Insufficient funds/
      );
    });
  });

  describe('computeBalance', () => {
    it('folds a sequence of entries', () => {
      const balance = computeBalance(0, [
        { type: 'credit', amount: 1000 },
        { type: 'debit', amount: 300 },
        { type: 'credit', amount: 50 },
      ]);
      expect(balance).toBe(750);
    });

    it('returns the opening balance for no entries', () => {
      expect(computeBalance(500, [])).toBe(500);
    });
  });

  describe('transferLines', () => {
    it('produces a balancing debit/credit pair', () => {
      const { debit, credit } = transferLines(400);
      expect(debit).toEqual({ type: 'debit', amount: 400 });
      expect(credit).toEqual({ type: 'credit', amount: 400 });
      // A transfer nets to zero across both accounts.
      expect(signedAmount(debit) + signedAmount(credit)).toBe(0);
    });

    it('rejects invalid amounts', () => {
      expect(() => transferLines(0)).toThrow();
      expect(() => transferLines(-5)).toThrow();
    });
  });
});
