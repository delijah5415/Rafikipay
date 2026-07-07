import crypto from 'crypto';
import {
  encrypt,
  decrypt,
  hash,
  generateToken,
  verifySignature,
} from '../crypto';

// A valid 32-byte (64 hex char) AES-256 key.
const MASTER_KEY = '0'.repeat(64);

describe('crypto', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ENCRYPTION_KEY;
    } else {
      process.env.ENCRYPTION_KEY = originalEnv;
    }
  });

  describe('encrypt / decrypt', () => {
    it('round-trips plaintext when given an explicit master key', () => {
      const plaintext = 'sensitive-account-number-12345';
      const ciphertext = encrypt(plaintext, MASTER_KEY);

      expect(ciphertext).not.toBe(plaintext);
      expect(decrypt(ciphertext, MASTER_KEY)).toBe(plaintext);
    });

    it('uses ENCRYPTION_KEY from the environment when no key is passed', () => {
      process.env.ENCRYPTION_KEY = MASTER_KEY;
      const plaintext = 'from-env';

      const ciphertext = encrypt(plaintext);
      expect(decrypt(ciphertext)).toBe(plaintext);
    });

    it('produces the iv:authTag:ciphertext format', () => {
      const ciphertext = encrypt('hello', MASTER_KEY);
      const parts = ciphertext.split(':');

      expect(parts).toHaveLength(3);
      // IV is 16 bytes -> 32 hex chars, auth tag is 16 bytes -> 32 hex chars.
      expect(parts[0]).toHaveLength(32);
      expect(parts[1]).toHaveLength(32);
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('produces a different ciphertext each time due to a random IV', () => {
      const a = encrypt('same-plaintext', MASTER_KEY);
      const b = encrypt('same-plaintext', MASTER_KEY);

      expect(a).not.toBe(b);
      expect(decrypt(a, MASTER_KEY)).toBe('same-plaintext');
      expect(decrypt(b, MASTER_KEY)).toBe('same-plaintext');
    });

    it('fails to decrypt when the ciphertext has been tampered with', () => {
      const ciphertext = encrypt('secret', MASTER_KEY);
      const [iv, authTag, data] = ciphertext.split(':');
      // Flip the last hex character of the encrypted payload.
      const lastChar = data[data.length - 1];
      const flipped = lastChar === 'a' ? 'b' : 'a';
      const tampered = `${iv}:${authTag}:${data.slice(0, -1)}${flipped}`;

      expect(() => decrypt(tampered, MASTER_KEY)).toThrow();
    });

    it('fails to decrypt with the wrong key', () => {
      const ciphertext = encrypt('secret', MASTER_KEY);
      const wrongKey = 'f'.repeat(64);

      expect(() => decrypt(ciphertext, wrongKey)).toThrow();
    });

    it('throws when no key is available', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encrypt('x')).toThrow(
        'ENCRYPTION_KEY environment variable not set'
      );
    });
  });

  describe('hash', () => {
    it('computes a deterministic SHA-256 hex digest', () => {
      const expected = crypto
        .createHash('sha256')
        .update('rafiki')
        .digest('hex');

      expect(hash('rafiki')).toBe(expected);
      expect(hash('rafiki')).toBe(hash('rafiki'));
    });

    it('produces different digests for different inputs', () => {
      expect(hash('a')).not.toBe(hash('b'));
    });
  });

  describe('generateToken', () => {
    it('defaults to 32 bytes (64 hex chars)', () => {
      expect(generateToken()).toHaveLength(64);
    });

    it('honors a custom length', () => {
      expect(generateToken(8)).toHaveLength(16);
    });

    it('returns unique values across calls', () => {
      expect(generateToken()).not.toBe(generateToken());
    });
  });

  describe('verifySignature', () => {
    const secret = 'webhook-secret';
    const data = '{"event":"payment.completed"}';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');

    it('returns true for a valid HMAC signature', () => {
      expect(verifySignature(data, validSignature, secret)).toBe(true);
    });

    it('returns false for an invalid signature', () => {
      expect(verifySignature(data, 'deadbeef', secret)).toBe(false);
    });

    it('returns false when the secret is wrong', () => {
      expect(verifySignature(data, validSignature, 'other-secret')).toBe(false);
    });
  });
});
