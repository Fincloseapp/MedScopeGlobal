import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAuditReport, listAuditReports } from "@/lib/v40/audit/engine";
import { AcademyAdminNav } from "@/components/academy/admin-nav";

export default async function AdminAcademyAuditPage() {
  const report = await generateAuditReport();
  const history = await listAuditReports(10);

  return (
    <>
      <AcademyAdminNav active="/admin/academy/audit" />
      <p className="mt-4 text-sm text-slate-600">
        MedScope v40 — AI audit engine. Týdenní cron: <code>/api/cron/v40-audit-weekly</code>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Audit skóre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.summary.score}</p>
            <p className="text-xs text-slate-500">{report.summary.status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Videa ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.videos.ready}</p>
            <p className="text-xs text-slate-500">{report.videos.with_audio} s audio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Kurzy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.courses.published}</p>
            <p className="text-xs text-slate-500">publikovaných</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Engines</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>LLM: {report.engines.llm ? "✓" : "✗"}</p>
            <p>OpenAI TTS: {report.engines.openai_tts ? "✓" : "✗"}</p>
            <p>D-ID: {report.engines.did ? "✓" : "✗"}</p>
          </CardContent>
        </Card>
      </div>

      {report.videos.issues.length || report.courses.issues.length ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-800">Problémy</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-900">
            {[...report.videos.issues, ...report.courses.issues, ...report.metadata.seo_issues].map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Skóre</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="px-4 py-3">{new Date(h.created_at).toLocaleString("cs-CZ")}</td>
                <td className="px-4 py-3">{Number(h.score).toFixed(0)}</td>
                <td className="px-4 py-3">{h.status}</td>
              </tr>
            ))}
            {!history.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  Zatím žádné uložené reporty — první běh vytvoří záznam.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        API: <Link href="/api/v40/audit/report" className="text-[#005B96] hover:underline">/api/v40/audit/report</Link>
      </p>
    </>
  );
}
