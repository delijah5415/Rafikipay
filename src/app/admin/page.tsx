import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import { createClient } from '../../lib/supabase/server';
import { isAdminEmail } from '../../lib/supabase/roles';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin — Rafikipay',
};

type Row = { status: string; _sum: { amount: unknown } };

async function getTotals(): Promise<Row[]> {
  try {
    return (await prisma.payment.groupBy({
      by: ['status'],
      _sum: { amount: true },
    })) as unknown as Row[];
  } catch {
    // DB may be unavailable (e.g. during static analysis) — render empty.
    return [];
  }
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }
  if (!isAdminEmail(user.email)) {
    redirect('/dashboard');
  }

  const totals = await getTotals();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-blue-600 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Payments by status</h2>
        {totals.length === 0 ? (
          <p className="text-gray-500">No payment data available.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Status</th>
                <th className="py-2">Total amount</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((row) => (
                <tr key={row.status} className="border-b last:border-0">
                  <td className="py-2 capitalize">{row.status}</td>
                  <td className="py-2">{String(row._sum.amount ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
