import Link from "next/link";

import { listMarketplaceEnrollments } from "@/lib/academy/marketplace-purchase";

export default async function AdminAcademyMarketplacePage() {
  const rows = await listMarketplaceEnrollments();
  const totalPurchases = rows.reduce((sum, r) => sum + r.purchaseCount, 0);
  const totalEnrollments = rows.reduce((sum, r) => sum + r.enrollments, 0);

  return (
    <>
      <p className="text-sm text-slate-600">
        Marketplace kurzů — nákupy, enrollment ověření a Stripe webhook logy.{" "}
        <Link href="/admin/stripe-webhook-logs" className="text-[#005B96] hover:underline">
          Webhook logs →
        </Link>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Nabídky</p>
          <p className="text-2xl font-bold text-[#021d33]">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Nákupy (webhook)</p>
          <p className="text-2xl font-bold text-[#021d33]">{totalPurchases}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Enrollment potvrzeno</p>
          <p className="text-2xl font-bold text-green-700">{totalEnrollments}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Kurz</th>
              <th className="px-4 py-3">Cena</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Nákupy</th>
              <th className="px-4 py-3">Enrollment</th>
              <th className="px-4 py-3">Poslední nákup</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Žádné marketplace nabídky.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const mismatch = row.purchaseCount > 0 && row.enrollments < row.purchaseCount;
                return (
                  <tr key={row.listingId} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#021d33]">{row.courseTitle}</p>
                      {row.courseSlug ? (
                        <Link
                          href={`/academy/courses/${row.courseSlug}`}
                          className="text-xs text-[#005B96] hover:underline"
                        >
                          /{row.courseSlug}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-slate-400">{row.courseId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.priceCzk.toLocaleString("cs-CZ")} Kč</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{row.purchaseCount}</td>
                    <td className="px-4 py-3">
                      <span className={mismatch ? "font-medium text-amber-700" : "text-green-700"}>
                        {row.enrollments}/{row.purchaseCount}
                      </span>
                      {mismatch ? (
                        <p className="text-xs text-amber-600">Čeká na webhook / progress</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {row.lastPurchaseAt
                        ? new Date(row.lastPurchaseAt).toLocaleString("cs-CZ")
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
