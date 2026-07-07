import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * M-Pesa Webhook Handler
 *
 * Receives payment callbacks from M-Pesa API
 * Features:
 * - Cryptographic validation of webhook signature (HMAC-SHA256)
 * - Transaction processing
 * - Error handling and logging
 *
 * TODO: Implement:
 * - Payment status processing
 * - Database transaction recording
 * - Webhook retry logic
 * - Logging and monitoring
 */

export async function POST(request: NextRequest) {
  try {
    // Read the raw body so the signature is computed over the exact bytes sent.
    const rawBody = await request.text();
    const signature = request.headers.get('x-mpesa-signature');

    if (!validateSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Validate the payload is well-formed JSON before processing.
    JSON.parse(rawBody);

    // TODO: Process payment
    // TODO: Update transaction status in database
    // TODO: Trigger billing or service activation
    // TODO: Send confirmation notifications
    console.log('M-Pesa webhook received');

    return NextResponse.json(
      { status: 'success', message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify the webhook signature using HMAC-SHA256 over the raw request body.
 * Fails closed: a missing secret or signature is treated as invalid.
 */
function validateSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.MPESA_WEBHOOK_SECRET;
  if (!secret) {
    console.error('MPESA_WEBHOOK_SECRET is not configured; rejecting webhook');
    return false;
  }
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  let signatureBuffer: Buffer;
  try {
    signatureBuffer = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }

  // Constant-time comparison; timingSafeEqual throws on length mismatch.
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
