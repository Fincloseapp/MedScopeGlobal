import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getAutopilotSettings } from "@/lib/queries/v6/autopilot";

export const metadata: Metadata = {
  title: "Autopilot nastavení",
};

export default async function AutopilotSettingsPage() {
  const settings = await getAutopilotSettings();

  const flags = [
    { key: "zero_touch_enabled", label: "Zero-touch provoz" },
    { key: "autopublish_enabled", label: "Autopublishing" },
    { key: "pubmed_monitor_enabled", label: "PubMed monitor" },
    { key: "regulatory_monitor_enabled", label: "Regulatory monitor (SÚKL/EMA/FDA)" },
    { key: "trend_analysis_enabled", label: "Trend analýza" },
    { key: "guideline_update_enabled", label: "Guideline update" },
  ] as const;

  return (
    <ModulePageShell
      eyebrow="V6"
      title="Autopilot nastavení"
      description="Zero-touch přepínače — úprava přes Supabase admin nebo service role API."
      ctaHref="/autopilot"
      ctaLabel="Autopilot"
    >
      <ul className="space-y-3">
        {flags.map((f) => (
          <li
            key={f.key}
            className="flex items-center justify-between rounded-lg border border-[#d9e8f4] bg-white px-4 py-3"
          >
            <span>{f.label}</span>
            <span
              className={
                settings?.[f.key]
                  ? "text-green-700 font-medium"
                  : "text-slate-400"
              }
            >
              {settings?.[f.key] ? "Zapnuto" : "Vypnuto"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-slate-500">
        Crony běží na Vercel ({`hourly_pubmed_monitor`}, `daily_regulatory_monitor`, …) a lze je volat
        přes Supabase Edge Functions se stejným názvem.
      </p>
    </ModulePageShell>
  );
}
