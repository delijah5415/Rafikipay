import { LinkButton } from './ui/button';
import { Plan, TAX_PERCENT } from '../config/plans';

export function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
        plan.featured ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'
      }`}
    >
      {plan.featured && (
        <span className="mb-2 self-start rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-gray-900">
          {plan.priceLabel}
        </span>
        {plan.priceCents > 0 && (
          <span className="text-sm text-gray-500">/mo</span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-400">+ {TAX_PERCENT}% tax</p>

      <ul className="mt-6 flex-1 space-y-2 text-sm text-gray-600">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="text-blue-600">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <LinkButton
        href={plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}`}
        variant={plan.featured ? 'primary' : 'secondary'}
        className="mt-6 w-full"
      >
        {plan.id === 'free' ? 'Get started' : `Choose ${plan.name}`}
      </LinkButton>
    </div>
  );
}
