import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../../lib/webhooks-verify';
import { paypalService } from '../../../../../services/paypal.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PayPal webhook (IPN) handler. Verifies the HMAC signature before
 * dispatching the event to the PayPal service.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paypal-transmission-sig');
    const secret = process.env.PAYPAL_WEBHOOK_SECRET || '';

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    await paypalService.handleWebhook(JSON.parse(rawBody));
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
