import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { aggregateWatchEvents } from "@/lib/v36/video-analytics/analyzer";

export default async function AdminVideoAnalyticsPage() {
  const admin = createServiceRoleClient();
  const { data: assets } = await admin
    .from("video_assets")
    .select("id, title, duration_seconds")
    .eq("status", "ready")
    .order("updated_at", { ascending: false })
    .limit(25);

  const rows = [];
  for (const asset of assets ?? []) {
    const { data: events } = await admin
      .from("video_watch_events")
      .select("event, position_sec, created_at, user_id, session_id")
      .eq("video_asset_id", asset.id)
      .limit(500);
    rows.push({
      ...asset,
      stats: aggregateWatchEvents(asset.id, events ?? []),
    });
  }

  const totalPlays = rows.reduce((s, r) => s + r.stats.plays, 0);

  return (
    <>
      <p className="text-sm text-slate-600">
        MedScope v36 — AI Video Analytics. API:{" "}
        <code>/api/academy/analytics/dashboard</code>
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Videa sledována</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Celkem přehrání</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPlays}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Přehrání</th>
              <th className="px-4 py-3">Dokončení</th>
              <th className="px-4 py-3">Ø sledování</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3">{r.stats.plays}</td>
                <td className="px-4 py-3">{Math.round(r.stats.completion_rate * 100)}%</td>
                <td className="px-4 py-3">{r.stats.avg_watch_sec}s</td>
              </tr>
            ))}
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
