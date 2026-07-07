import {
  computeHmacSignature,
  safeEqual,
  verifyWebhookSignature,
} from '../webhooks-verify';

describe('webhooks-verify', () => {
  const secret = 'shared-secret';
  const body = '{"event":"payment.completed","id":"abc"}';
  const validSig = computeHmacSignature(body, secret);

  describe('computeHmacSignature', () => {
    it('is deterministic for the same body + secret', () => {
      expect(computeHmacSignature(body, secret)).toBe(validSig);
    });
    it('changes when the body changes', () => {
      expect(computeHmacSignature(body + 'x', secret)).not.toBe(validSig);
    });
  });

  describe('safeEqual', () => {
    it('returns true for identical strings', () => {
      expect(safeEqual('abc', 'abc')).toBe(true);
    });
    it('returns false for differing strings or lengths', () => {
      expect(safeEqual('abc', 'abd')).toBe(false);
      expect(safeEqual('abc', 'abcd')).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('accepts a valid signature', () => {
      expect(verifyWebhookSignature(body, validSig, secret)).toBe(true);
    });
    it('rejects an invalid signature', () => {
      expect(verifyWebhookSignature(body, 'deadbeef', secret)).toBe(false);
    });
    it('rejects a missing signature', () => {
      expect(verifyWebhookSignature(body, null, secret)).toBe(false);
      expect(verifyWebhookSignature(body, undefined, secret)).toBe(false);
      expect(verifyWebhookSignature(body, '', secret)).toBe(false);
    });
    it('rejects when signed with the wrong secret', () => {
      expect(verifyWebhookSignature(body, validSig, 'other')).toBe(false);
    });
  });
});
