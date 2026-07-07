/**
 * Atomic double-entry ledger helpers.
 *
 * Balances are tracked in the smallest currency unit (cents) as integers
 * to avoid floating-point drift. A credit increases a wallet balance, a
 * debit decreases it. Every entry must have a positive amount.
 */

export type LedgerEntryType = 'credit' | 'debit';

export interface LedgerLine {
  type: LedgerEntryType;
  /** Positive amount in cents. */
  amount: number;
}

/** Signed effect of a single ledger line on a balance (in cents). */
export function signedAmount(line: LedgerLine): number {
  if (!Number.isInteger(line.amount) || line.amount <= 0) {
    throw new Error('Ledger amount must be a positive integer (cents)');
  }
  return line.type === 'credit' ? line.amount : -line.amount;
}

/** Apply a single entry to a balance, rejecting overdrafts. */
export function applyEntry(balance: number, line: LedgerLine): number {
  const next = balance + signedAmount(line);
  if (next < 0) {
    throw new Error('Insufficient funds: entry would overdraw the wallet');
  }
  return next;
}

/** Fold a sequence of entries onto a starting balance. */
export function computeBalance(
  openingBalance: number,
  lines: LedgerLine[]
): number {
  return lines.reduce((balance, line) => applyEntry(balance, line), openingBalance);
}

/**
 * Build the balancing pair of lines for moving `amount` cents between two
 * accounts (debit source, credit destination). Used to keep transfers
 * double-entry balanced.
 */
export function transferLines(amount: number): { debit: LedgerLine; credit: LedgerLine } {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Transfer amount must be a positive integer (cents)');
  }
  return {
    debit: { type: 'debit', amount },
    credit: { type: 'credit', amount },
  };
}
