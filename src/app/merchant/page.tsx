import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Merchant — Rafikipay',
};

/**
 * Merchant control panel.
 *
 * Payout balances, API keys and settlement tools live here. Data wiring
 * (payouts, API key issuance) is left as follow-up work.
 */
export default async function MerchantPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/merchant');
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Merchant</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Go to dashboard →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card title="Available balance" value="$0.00" />
        <Card title="Pending payouts" value="$0.00" />
        <Card title="This month's volume" value="$0.00" />
      </div>

      <section className="mt-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Payouts</h2>
        <p className="mt-2 text-gray-500">No payouts yet.</p>
      </section>

      <section className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">API keys</h2>
        <p className="mt-2 text-gray-500">
          Generate keys to integrate Rafikipay into your storefront.
        </p>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-2 text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
