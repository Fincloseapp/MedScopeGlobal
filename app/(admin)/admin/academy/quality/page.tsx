import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listQualityReviews } from "@/lib/v37/quality-engine/autoFix";

export default async function AdminAcademyQualityPage() {
  const reviews = await listQualityReviews(40);
  const lowScore = reviews.filter((r) => Number(r.score) < 70);

  return (
    <>
      <p className="text-sm text-slate-600">
        MedScope v37 — AI Content Quality Engine. Týdenní cron:{" "}
        <code>/api/cron/academy-quality-weekly</code>
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
            <CardTitle className="text-sm">Nízké skóre (&lt;70)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{lowScore.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auto-fixed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {reviews.filter((r) => r.status === "auto_fixed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Skóre</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Problémy</th>
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
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-slate-600">
                  {Array.isArray(r.issues) ? (r.issues as string[]).slice(0, 2).join("; ") : "—"}
                </td>
              </tr>
            ))}
            {!reviews.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Zatím žádné review — spusťte týdenní cron nebo počkejte na plánovaný běh.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        <Link href="/admin/academy" className="text-[#005B96] hover:underline">
          ← Zpět na Academy admin
        </Link>
      </p>
    </>
  );
}
