"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdsOverview, StudentAdCampaign } from "@/lib/queries/marketing";
import type { PublicAdCampaign } from "@/lib/queries/verejnost";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CampaignRow = {
  id: string;
  audience: "public" | "student" | "pro";
  title: string;
  active: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
};

const AUDIENCE_LABELS: Record<CampaignRow["audience"], string> = {
  public: "Veřejnost",
  student: "Studenti",
  pro: "Pro / B2B",
};

export function AdPerformanceByCampaign({
  campaignSummary,
}: {
  campaignSummary: AdsOverview["campaigns"];
}) {
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [publicRes, studentRes] = await Promise.all([
        fetch("/api/admin/ads-public"),
        fetch("/api/admin/ads-students"),
      ]);
      const publicJson = (await publicRes.json()) as {
        ok?: boolean;
        campaigns?: PublicAdCampaign[];
      };
      const studentJson = (await studentRes.json()) as {
        ok?: boolean;
        campaigns?: StudentAdCampaign[];
      };

      const combined: CampaignRow[] = [];

      for (const c of publicJson.campaigns ?? []) {
        combined.push(toRow("public", c.title, c.active, c.impressions, c.clicks, c.id));
      }
      for (const c of studentJson.campaigns ?? []) {
        combined.push(toRow("student", c.title, c.active, c.impressions, c.clicks, c.id));
      }

      if (campaignSummary.pro.active > 0 || campaignSummary.pro.impressions > 0) {
        combined.push({
          id: "pro-aggregate",
          audience: "pro",
          title: "Pro / B2B — agregát",
          active: campaignSummary.pro.active > 0,
          impressions: campaignSummary.pro.impressions,
          clicks: campaignSummary.pro.clicks,
          ctr: campaignSummary.pro.impressions
            ? (campaignSummary.pro.clicks / campaignSummary.pro.impressions) * 100
            : 0,
        });
      }

      combined.sort((a, b) => b.impressions - a.impressions);
      setRows(combined);
    } finally {
      setLoading(false);
    }
  }, [campaignSummary]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        impressions: acc.impressions + r.impressions,
        clicks: acc.clicks + r.clicks,
      }),
      { impressions: 0, clicks: 0 }
    );
  }, [rows]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#021d33]">Výkon podle kampaně</h2>
          <p className="text-sm text-muted-foreground">
            Veřejné a studentské kampaně + agregát Pro segmentu.
          </p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {totals.impressions.toLocaleString("cs-CZ")} imprese ·{" "}
          {totals.impressions > 0
            ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)} % CTR`
            : "0.00 % CTR"}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Načítám kampaně…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Zatím žádné kampaně k zobrazení.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kampaň</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="text-right">Imprese</TableHead>
                <TableHead className="text-right">Kliky</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {AUDIENCE_LABELS[row.audience]}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.active ? "default" : "secondary"}>
                      {row.active ? "Aktivní" : "Neaktivní"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.impressions.toLocaleString("cs-CZ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.clicks.toLocaleString("cs-CZ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.ctr.toFixed(2)} %</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function toRow(
  audience: CampaignRow["audience"],
  title: string,
  active: boolean,
  impressions: number,
  clicks: number,
  id: string
): CampaignRow {
  return {
    id,
    audience,
    title,
    active,
    impressions: impressions ?? 0,
    clicks: clicks ?? 0,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
  };
}
