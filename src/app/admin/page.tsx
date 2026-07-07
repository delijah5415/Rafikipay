import prisma from '../../lib/prisma';

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
  const totals = await getTotals();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Admin</h1>

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
