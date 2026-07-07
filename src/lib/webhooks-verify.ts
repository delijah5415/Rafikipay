import crypto from 'crypto';

/**
 * Webhook signature verification helpers.
 *
 * Each payment rail signs its callbacks with an HMAC-SHA256 of the raw
 * request body using a shared secret. These helpers centralize that
 * verification so route handlers don't reimplement it per provider.
 */

/** Compute the HMAC-SHA256 hex signature of a payload. */
export function computeHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Constant-time comparison of two signatures. Returns false on any
 * length mismatch or malformed input instead of throwing.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify an incoming webhook signature against the expected HMAC of the
 * raw body. Returns false if the signature is missing/empty.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = computeHmacSignature(rawBody, secret);
  return safeEqual(expected, signature);
}
