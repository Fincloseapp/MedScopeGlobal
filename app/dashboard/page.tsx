import type { Metadata } from "next";
import Link from "next/link";
import { SimpleBarChart } from "@/components/v6/simple-bar-chart";
import { DiagnosisHeatmap } from "@/components/v6/diagnosis-heatmap";
import { getDashboardStats } from "@/lib/queries/v6/dashboard";

export const metadata: Metadata = {
  title: "AI Dashboard",
  description: "V6 Autopilot — trendy RA, evidence scoring, regulatory alerts.",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="bg-[#fafcff]">
      <section className="border-b border-[#d9e8f4] bg-[linear-gradient(180deg,#fff_0%,#f0f7fc_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            V6 · AI Autopilot
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">AI Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Monitoring PubMed, SÚKL, EMA, FDA — statistiky, trendy a regulatory alerts (zero-touch).
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/autopilot" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
              Autopilot
            </Link>
            <Link
              href="/pro-me/lekari"
              className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]"
            >
              Pro lékaře
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 grid gap-8 md:grid-cols-2">
        <section className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-[#021d33]">Přehled</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Studie / články", value: stats.studiesCount },
              { label: "Zdroje", value: stats.sourcesCount },
              { label: "Reg. léky", value: stats.drugSources },
              { label: "Alerty", value: stats.alerts.length },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-[#f0f7fc] p-4 text-center">
                <p className="text-2xl font-bold text-[#005B96]">{s.value}</p>
                <p className="text-xs text-slate-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Trend RA · DMARD · bDMARD (7 dní)</h2>
          <SimpleBarChart
            data={[
              { label: "RA", value: stats.trendSeries.ra, color: "#005B96" },
              { label: "DMARD", value: stats.trendSeries.dmards, color: "#2a7ab8" },
              { label: "bDMARD", value: stats.trendSeries.bdmards, color: "#5ba3d0" },
            ]}
          />
        </section>

        <section className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Evidence scoring</h2>
          <SimpleBarChart
            data={[
              { label: "A", value: stats.evidenceLevels.A, color: "#0d7a4a" },
              { label: "B", value: stats.evidenceLevels.B, color: "#2a9d6a" },
              { label: "C", value: stats.evidenceLevels.C, color: "#e6a800" },
              { label: "D", value: stats.evidenceLevels.D, color: "#c45c5c" },
            ]}
          />
        </section>

        <section className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold">Heatmapa diagnóz</h2>
          <div className="mt-4">
            <DiagnosisHeatmap counts={stats.diagnosisCounts} />
          </div>
        </section>

        <section className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold">Regulatory & study alerts</h2>
          <ul className="mt-4 space-y-2">
            {stats.alerts.length ? (
              stats.alerts.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between gap-4 rounded-lg border border-[#e8f2f9] px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium text-[#005B96]">{a.alert_type}</span> — {a.title}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    {new Date(a.created_at).toLocaleDateString("cs-CZ")}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 text-sm">Žádné alerty — cron monitor je spustí.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
