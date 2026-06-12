"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import type {
  AdsOverview,
  CategoryPerformance,
  MarketerActivityLog,
} from "@/lib/queries/marketing";
import { MarketerActivityTable } from "./components/MarketerActivityTable";
import { CoordinatorDecisions } from "./components/CoordinatorDecisions";
import { AdPerformanceByCategory } from "./components/AdPerformanceByCategory";
import { AdPerformanceByCampaign } from "./components/AdPerformanceByCampaign";
import { ManualAdInsert } from "./components/ManualAdInsert";

type AdsOverviewResponse = {
  ok?: boolean;
  overview?: AdsOverview;
  activity?: MarketerActivityLog[];
  categoryPerformance?: CategoryPerformance[];
  error?: string;
};

export default function AdminAdsOverviewPage() {
  const [overview, setOverview] = useState<AdsOverview | null>(null);
  const [activity, setActivity] = useState<MarketerActivityLog[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads-overview?activityLimit=100");
      const json = (await res.json()) as AdsOverviewResponse;
      if (!res.ok || !json.ok || !json.overview) {
        setLoadError(json.error ?? "Načtení přehledu selhalo");
        return;
      }
      setOverview(json.overview);
      setActivity(json.activity ?? []);
      setCategoryPerformance(json.categoryPerformance ?? []);
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalImpressions =
    overview == null
      ? 0
      : overview.campaigns.public.impressions +
        overview.campaigns.student.impressions +
        overview.campaigns.pro.impressions;

  const totalClicks =
    overview == null
      ? 0
      : overview.campaigns.public.clicks +
        overview.campaigns.student.clicks +
        overview.campaigns.pro.clicks;

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/ads-overview" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Ads Overview v25.3</h1>
        <p className="mt-1 text-sm text-slate-600">
          Koordinátor marketingu, 3 AI marketéři, výkon kampaní a ruční vkládání reklam.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/marketing-hub" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Marketing hub
          </Link>
          <Link href="/admin/ads-public" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Veřejné reklamy
          </Link>
          <Link href="/admin/ads-students" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Studentské reklamy
          </Link>
        </div>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {loading && !overview ? (
        <p className="text-sm text-muted-foreground">Načítám přehled…</p>
      ) : overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Návrhy čekající", value: overview.proposals.pending },
              { label: "Schválené návrhy", value: overview.proposals.approved },
              { label: "Aktivita (24 h)", value: overview.marketerActivity.last24h },
              {
                label: "Celkové CTR",
                value: `${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00"} %`,
              },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-[#021d33]">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Veřejné kampaně",
                active: overview.campaigns.public.active,
                impressions: overview.campaigns.public.impressions,
              },
              {
                label: "Studentské kampaně",
                active: overview.campaigns.student.active,
                impressions: overview.campaigns.student.impressions,
              },
              {
                label: "Pro / B2B kampaně",
                active: overview.campaigns.pro.active,
                impressions: overview.campaigns.pro.impressions,
              },
              {
                label: "Ruční placementy",
                active: overview.campaigns.manual.active,
                impressions: overview.campaigns.manual.total,
              },
            ].map((seg) => (
              <div key={seg.label} className="rounded-xl border bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {seg.label}
                </p>
                <p className="mt-1 font-display text-xl font-bold text-[#021d33]">
                  {seg.active} aktivní
                </p>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  {seg.impressions.toLocaleString("cs-CZ")}{" "}
                  {seg.label.includes("Ruční") ? "celkem" : "imprese"}
                </p>
              </div>
            ))}
          </div>

          <CoordinatorDecisions coordinator={overview.coordinator} onUpdated={load} />
          <MarketerActivityTable activity={activity} byMarketer={overview.marketerActivity.byMarketer} />
          <AdPerformanceByCategory categories={categoryPerformance} />
          <AdPerformanceByCampaign campaignSummary={overview.campaigns} />
          <ManualAdInsert onChanged={load} />
        </>
      ) : null}
    </div>
  );
}
