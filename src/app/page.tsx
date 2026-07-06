import Link from 'next/link';

/**
 * Landing Page
 * 
 * TODO: Implement features:
 * - Hero section with CTA
 * - Features showcase (M-Pesa, PayPal, Bank integration)
 * - Pricing section
 * - Testimonials
 * - FAQ section
 * - Footer with links
 * - Authentication entry points (Login/Sign up)
 */

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Rafikipay
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Secure Payment Processing Platform
        </p>
        <p className="text-gray-500 mb-8">
          Integrated M-Pesa, PayPal, and Bank payment processing
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Dashboard
          </Link>
          {/* TODO: Add login/signup routes */}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TODO: Add feature cards */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🇰🇪 M-Pesa</h3>
            <p className="text-gray-600">Mobile money integration</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">💳 PayPal</h3>
            <p className="text-gray-600">Global payment gateway</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🏦 Banking</h3>
            <p className="text-gray-600">Direct bank transfers</p>
          </div>
        </div>
      </div>
    </main>
  );
}