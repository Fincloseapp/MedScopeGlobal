import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getAutopilotRuns } from "@/lib/queries/v6/autopilot";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Autopilot logy",
};

export default async function AutopilotLogsPage() {
  const runs = await getAutopilotRuns(50);
  const supabase = await createClient();
  const { data: alerts } = await supabase
    .from("autopilot_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <ModulePageShell
      eyebrow="V6"
      title="Autopilot logy"
      description="Běhy cron jobů a systémové alerty."
      ctaHref="/autopilot"
      ctaLabel="Zpět na Autopilot"
    >
      <Link href="/autopilot/settings" className="text-sm text-[#005B96] underline mb-6 inline-block">
        Nastavení
      </Link>

      <h2 className="font-semibold">Běhy ({runs.length})</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Vytvořeno</th>
              <th className="py-2">Čas</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-[#eef4f9]">
                <td className="py-2 font-mono text-xs">{r.job_slug}</td>
                <td className="py-2">{r.status}</td>
                <td className="py-2">{r.items_created}</td>
                <td className="py-2 text-slate-500">
                  {new Date(r.started_at).toLocaleString("cs-CZ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold mt-10">Alerty</h2>
      <ul className="mt-3 space-y-2">
        {(alerts ?? []).map((a) => (
          <li key={a.id} className="text-sm border border-[#e8f2f9] rounded-lg px-3 py-2">
            [{a.severity}] {a.alert_type}: {a.title}
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
