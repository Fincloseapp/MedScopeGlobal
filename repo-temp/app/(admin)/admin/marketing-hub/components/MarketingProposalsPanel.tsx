"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketingProposal, MarketingProposalStatus } from "@/lib/queries/marketing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MARKETER_LABELS: Record<string, string> = {
  public: "Veřejnost",
  students: "Studenti",
  pro: "Pro / B2B",
};

const STATUS_LABELS: Record<MarketingProposalStatus, string> = {
  pending: "Čeká",
  approved: "Schváleno",
  rejected: "Zamítnuto",
};

export function MarketingProposalsPanel({
  initialProposals,
}: {
  initialProposals: MarketingProposal[];
}) {
  const [proposals, setProposals] = useState(initialProposals);
  const [filter, setFilter] = useState<MarketingProposalStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);

  const reload = useCallback(async () => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/marketing/proposals${params}`);
    const json = (await res.json()) as { ok?: boolean; proposals?: MarketingProposal[] };
    if (json.ok && json.proposals) setProposals(json.proposals);
  }, [filter]);

  useEffect(() => {
    if (filter !== "all") void reload();
  }, [filter, reload]);

  async function updateStatus(id: string, status: MarketingProposalStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/marketing/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json.ok) await reload();
    } finally {
      setBusyId(null);
    }
  }

  const filtered =
    filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#021d33]">AI marketer — návrhy kampaní</h2>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === s
                  ? "bg-[#005B96] text-white"
                  : "border border-slate-200 text-slate-600 hover:border-[#005B96]/40"
              }`}
            >
              {s === "all" ? "Vše" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Žádné návrhy v této kategorii.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Marketer</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="text-right">Priorita</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[200px] font-medium">{p.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {MARKETER_LABELS[p.marketer_id] ?? p.marketer_id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.partner_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "approved"
                          ? "default"
                          : p.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {STATUS_LABELS[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.priority}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "pending" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === p.id}
                          onClick={() => updateStatus(p.id, "approved")}
                        >
                          Schválit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === p.id}
                          onClick={() => updateStatus(p.id, "rejected")}
                        >
                          Zamítnout
                        </Button>
                      </div>
                    ) : p.coordinator_notes ? (
                      <span className="text-xs text-muted-foreground">{p.coordinator_notes}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
