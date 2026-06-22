import type { Metadata } from "next";
import Link from "next/link";
import { getAutopilotCronJobs, getAutopilotRuns } from "@/lib/queries/v6/autopilot";

export const metadata: Metadata = { title: "V6 Autopilot" };

export default async function AdminAutopilotPage() {
  const [jobs, runs] = await Promise.all([getAutopilotCronJobs(), getAutopilotRuns(15)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">V6 Autopilot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitoring PubMed, regulace, autopublish a trend analýza — pouze pro administrátory.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
          AI Dashboard
        </Link>
        <Link href="/admin/ingestion" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
          AI ingestion
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Cron jobs</h2>
        <ul className="mt-3 space-y-2">
          {jobs.map((j) => (
            <li key={j.slug} className="rounded-lg border bg-white px-4 py-3 text-sm">
              <span className="font-mono text-primary">{j.slug}</span>
              <span className="ml-2 text-muted-foreground">({j.schedule})</span>
              <p className="mt-1 text-muted-foreground">{j.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {j.last_status ?? "—"} ·{" "}
                {j.last_run_at ? new Date(j.last_run_at).toLocaleString("cs-CZ") : "nikdy"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Poslední běhy</h2>
        <ul className="mt-3 space-y-2">
          {runs.map((r) => (
            <li key={r.id} className="rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">{r.job_slug}</span> — {r.status} · {r.items_created} vytvořeno
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
