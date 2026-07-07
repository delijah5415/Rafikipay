import Link from 'next/link';

export const metadata = {
  title: 'About — Rafikipay',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back home
      </Link>
      <h1 className="mt-4 text-4xl font-bold text-gray-900">About Rafikipay</h1>
      <p className="mt-4 text-gray-600">
        Rafikipay is a unified payments platform built for African markets and
        beyond. We bring M-Pesa, PayPal, card and bank rails together behind a
        single, secure API so businesses can accept and reconcile payments
        without juggling multiple integrations.
      </p>
      <p className="mt-4 text-gray-600">
        Every transaction is encrypted at rest, signed webhooks are verified on
        arrival, and balances are tracked with a double-entry ledger for full
        auditability.
      </p>
    </main>
  );
}
