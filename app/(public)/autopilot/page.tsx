import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getAutopilotCronJobs, getAutopilotRuns } from "@/lib/queries/v6/autopilot";

export const metadata: Metadata = {
  title: "AI Autopilot",
  description: "V6 zero-touch — monitoring, autopublish, trendy, alerty.",
};

export default async function AutopilotPage() {
  const [jobs, runs] = await Promise.all([getAutopilotCronJobs(), getAutopilotRuns(10)]);

  return (
    <ModulePageShell
      eyebrow="V6 · Autopilot"
      title="AI Autopilot Engine"
      description="Autonomní monitoring PubMed, SÚKL, EMA, FDA, autopublishing a trend analýza."
      ctaHref="/dashboard"
      ctaLabel="AI Dashboard"
    >
      <div className="flex flex-wrap gap-2 mb-8 text-sm">
        <Link href="/autopilot/logs" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Logy
        </Link>
        <Link href="/autopilot/settings" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Nastavení
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-[#021d33]">Cron jobs</h2>
      <ul className="mt-3 space-y-2">
        {jobs.map((j) => (
          <li key={j.slug} className="rounded-lg border border-[#d9e8f4] bg-white px-4 py-3 text-sm">
            <span className="font-mono text-[#005B96]">{j.slug}</span>
            <span className="text-slate-500 ml-2">({j.schedule})</span>
            <p className="text-slate-600 mt-1">{j.description}</p>
            <p className="text-xs text-slate-400 mt-1">
              Edge: {j.edge_function} · {j.last_status ?? "—"} ·{" "}
              {j.last_run_at ? new Date(j.last_run_at).toLocaleString("cs-CZ") : "nikdy"}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold text-[#021d33] mt-10">Poslední běhy</h2>
      <ul className="mt-3 space-y-2">
        {runs.map((r) => (
          <li key={r.id} className="text-sm rounded-lg border border-[#e8f2f9] px-3 py-2">
            <span className="font-medium">{r.job_slug}</span> — {r.status} · {r.items_created} vytvořeno
          </li>
        ))}
      </ul>
    </ModulePageShell>
  );
}
