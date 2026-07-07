import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../../lib/webhooks-verify';
import { bankService } from '../../../../../services/bank.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Banking aggregator webhook handler (KCB / I&M / etc.). Verifies the
 * HMAC signature before dispatching to the bank service.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-bank-signature');
    const secret = process.env.BANK_WEBHOOK_SECRET || '';

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    await bankService.handleCallback(JSON.parse(rawBody));
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Banking webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
