import Link from 'next/link';
import { PricingCard } from '../../../components/PricingCard';
import { PLAN_LIST, TAX_PERCENT } from '../../../config/plans';

export const metadata = {
  title: 'Pricing — Rafikipay',
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-4 text-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back home
        </Link>
      </div>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-3 text-gray-600">
          Pick a plan that fits. A flat {TAX_PERCENT}% tax is added to every
          payment at checkout.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_LIST.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </main>
  );
}
