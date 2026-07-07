/**
 * Dashboard Page - Completed UI Tracking
 * 
 * Features to implement:
 * - Transaction history table
 * - Real-time balance display
 * - Payment method management
 * - Quick payment form
 * - Analytics/charts (revenue, transactions, etc.)
 * - Notification center
 * - Settings panel
 * - Account management
 * 
 * TODO: Complete implementation
 */

import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { isAdminEmail } from '../../lib/supabase/roles';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/dashboard');
  }

  const name = (user.user_metadata?.full_name as string) || user.email;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Signed in as {name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {isAdminEmail(user.email) && (
            <a href="/admin" className="text-blue-600 hover:underline">
              Admin
            </a>
          )}
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* TODO: Add dashboard components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stats cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Balance</h3>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Today's Transactions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Pending Payments</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Failed Transactions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* TODO: Add transaction history table */}
      {/* TODO: Add charts and analytics */}
      {/* TODO: Add quick payment form */}
      {/* TODO: Add notifications */}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <p className="text-gray-500">No transactions yet</p>
      </div>
    </div>
  );
}