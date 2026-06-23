import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listMedicalReviews } from "@/lib/v39/medical-review/persist";
import { AcademyAdminNav } from "@/components/academy/admin-nav";
import { GUIDELINE_SOURCES } from "@/lib/v39/medical-review/engine";

export default async function AdminMedicalReviewPage() {
  const reviews = await listMedicalReviews(40);
  const critical = reviews.filter((r) => r.severity === "critical");
  const warnings = reviews.filter((r) => r.severity === "warning");

  return (
    <>
      <AcademyAdminNav active="/admin/academy/medical-review" />
      <p className="mt-4 text-sm text-slate-600">
        MedScope v39 — AI medicínská kontrola. Týdenní cron:{" "}
        <code>/api/cron/v39-medical-weekly</code>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Celkem review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Kritické</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{critical.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Varování</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{warnings.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-700">Guideline zdroje</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GUIDELINE_SOURCES.map((g) => (
            <li key={g} className="rounded-full bg-[#e8f4fc] px-3 py-1 text-xs font-medium text-[#005B96]">
              {g.split(" (")[0]}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Skóre</th>
              <th className="px-4 py-3">Závažnost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Návrhy</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {r.entity_type}
                  <span className="ml-1 text-xs text-slate-400">{String(r.entity_id).slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3">{Number(r.score).toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.severity === "critical"
                        ? "text-red-600"
                        : r.severity === "warning"
                          ? "text-amber-600"
                          : "text-slate-600"
                    }
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-slate-600">
                  {Array.isArray((r.review as { suggestions?: string[] })?.suggestions)
                    ? (r.review as { suggestions: string[] }).suggestions.slice(0, 1).join("; ")
                    : "—"}
                </td>
              </tr>
            ))}
            {!reviews.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Zatím žádné medicínské review — spusťte týdenní cron nebo POST /api/v39/medical/review
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        API: <Link href="/api/v39/health" className="text-[#005B96] hover:underline">/api/v39/health</Link>
      </p>
    </>
  );
}
