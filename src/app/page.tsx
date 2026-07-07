import Link from 'next/link';
import { LinkButton } from '../components/ui/button';
import { PricingCard } from '../components/PricingCard';
import { PLAN_LIST } from '../config/plans';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <header className="flex items-center justify-between py-6">
        <span className="text-xl font-bold text-gray-900">Rafikipay</span>
        <nav className="flex items-center gap-2">
          <Link href="/pricing" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/about" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            About
          </Link>
          <LinkButton href="/login" variant="ghost">Log in</LinkButton>
          <LinkButton href="/signup" variant="primary">Sign up</LinkButton>
        </nav>
      </header>

      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
          Payments for Africa and beyond
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
          Accept M-Pesa, PayPal, cards and bank transfers with one unified,
          secure platform.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <LinkButton href="/signup">Start for free</LinkButton>
          <LinkButton href="/dashboard" variant="secondary">
            View dashboard
          </LinkButton>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 py-8 md:grid-cols-3">
        <Feature icon="🇰🇪" title="M-Pesa" desc="STK Push & Daraja integration" />
        <Feature icon="💳" title="PayPal & Cards" desc="Global checkout via Stripe & PayPal" />
        <Feature icon="🏦" title="Banking" desc="Direct bank transfers & payouts" />
      </section>

      <section id="pricing" className="py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-2 text-gray-600">
            Every plan includes a flat 2% tax at checkout.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_LIST.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Rafikipay. All rights reserved.
      </footer>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
