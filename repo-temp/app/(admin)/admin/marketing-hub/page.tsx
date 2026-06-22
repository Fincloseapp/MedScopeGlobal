import type { Metadata } from "next";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { computeAdStats } from "@/lib/marketing/helpers";
import { loadMarketingPartners } from "@/lib/marketing/partners";
import {
  listMarketingProposals,
  listMarketingReports,
  listProAdCampaigns,
  listStudentAdCampaigns,
} from "@/lib/queries/marketing";
import { listPublicAdCampaigns } from "@/lib/queries/verejnost";
import { MarketingProposalsPanel } from "./components/MarketingProposalsPanel";

export const metadata: Metadata = {
  title: "Marketing Hub — Observabilita | Admin",
};

export const dynamic = "force-dynamic";

const MARKETER_LABELS: Record<string, string> = {
  public: "Veřejnost",
  students: "Studenti",
  pro: "Pro / B2B",
};

export default async function AdminMarketingHubPage() {
  const [publicCampaigns, studentCampaigns, proCampaigns, proposals, reports, partners] =
    await Promise.all([
      listPublicAdCampaigns({ activeOnly: false }).catch(() => []),
      listStudentAdCampaigns({ activeOnly: false }).catch(() => []),
      listProAdCampaigns({ activeOnly: false }).catch(() => []),
      listMarketingProposals({ limit: 50 }).catch(() => []),
      listMarketingReports(6).catch(() => []),
      Promise.resolve(loadMarketingPartners()),
    ]);

  const publicStats = computeAdStats(publicCampaigns);
  const studentStats = computeAdStats(studentCampaigns);
  const proStats = computeAdStats(proCampaigns);

  const pending = proposals.filter((p) => p.status === "pending").length;
  const approved = proposals.filter((p) => p.status === "approved").length;
  const rejected = proposals.filter((p) => p.status === "rejected").length;

  const b2bByCategory = proCampaigns.reduce<Record<string, number>>((acc, c) => {
    const cat = c.b2b_category ?? "other";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const affiliateClicks =
    publicStats.clicks + studentStats.clicks + proStats.clicks;
  const affiliateImpressions =
    publicStats.impressions + studentStats.impressions + proStats.impressions;

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/marketing-hub" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Marketing Hub</h1>
        <p className="mt-1 text-sm text-slate-600">
          Observabilita Ad Engine v25.2 — 3 AI marketéři, koordinátor a výkon kampaní.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/ads-public" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Veřejné reklamy
          </Link>
          <Link href="/admin/ads-students" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Studentské reklamy
          </Link>
          <Link href="/admin/verejnost" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Veřejnost
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Návrhy čekající", value: pending },
          { label: "Schválené", value: approved },
          { label: "Zamítnuté", value: rejected },
          {
            label: "Affiliate CTR",
            value: `${affiliateImpressions > 0 ? ((affiliateClicks / affiliateImpressions) * 100).toFixed(2) : "0.00"} %`,
          },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#021d33]">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">Výkon podle segmentu</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { label: "Veřejné", stats: publicStats, href: "/admin/ads-public" },
            { label: "Studentské", stats: studentStats, href: "/admin/ads-students" },
            { label: "Pro / B2B", stats: proStats, href: "/admin/marketing-hub" },
          ].map((seg) => (
            <div key={seg.label} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#021d33]">{seg.label}</p>
                <Link href={seg.href} className="text-xs text-[#005B96] hover:underline">
                  Správa →
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Aktivní</p>
                  <p className="font-semibold tabular-nums">{seg.stats.active}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Celkem</p>
                  <p className="font-semibold tabular-nums">{seg.stats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Imprese</p>
                  <p className="font-semibold tabular-nums">
                    {seg.stats.impressions.toLocaleString("cs-CZ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CTR</p>
                  <p className="font-semibold tabular-nums">{seg.stats.ctr.toFixed(2)} %</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">B2B / OTC kategorie (Pro)</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(b2bByCategory).length ? (
            Object.entries(b2bByCategory).map(([cat, count]) => (
              <div key={cat} className="rounded-lg border bg-white px-3 py-2">
                <p className="text-xs text-muted-foreground">{cat}</p>
                <p className="font-semibold tabular-nums">{count}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Zatím žádné Pro kampaně.</p>
          )}
        </div>
      </section>

      <MarketingProposalsPanel initialProposals={proposals} />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">Týdenní reporty koordinátora</h2>
        {reports.length ? (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-[#021d33]">
                    Týden od {new Date(r.week_start).toLocaleDateString("cs-CZ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.proposals_pending} čeká · {r.proposals_approved} schváleno ·{" "}
                    {r.proposals_rejected} zamítnuto
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{r.summary}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Koordinátor zatím nevygeneroval týdenní report.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">Partneři (affiliate)</h2>
        {partners.length ? (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3">Partner</th>
                  <th className="p-3">Kategorie</th>
                  <th className="p-3 text-right">Provize %</th>
                  <th className="p-3 text-right">Skóre</th>
                </tr>
              </thead>
              <tbody>
                {partners.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="p-3 text-right tabular-nums">{p.commission_pct ?? "—"}</td>
                    <td className="p-3 text-right tabular-nums">{p.score ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            partners.json zatím prázdný — AI marketéři doplní při běhu orchestrátoru.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">Rozdělení návrhů podle marketéra</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["public", "students", "pro"] as const).map((id) => {
            const count = proposals.filter((p) => p.marketer_id === id).length;
            return (
              <div key={id} className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">{MARKETER_LABELS[id]}</p>
                <p className="font-semibold tabular-nums">{count}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
