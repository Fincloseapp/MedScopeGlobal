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
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);

  const reload = useCallback(async () => {
    setRefreshing(true);
    setActionError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/marketing/proposals?${params}`);
      const json = (await res.json()) as {
        ok?: boolean;
        proposals?: MarketingProposal[];
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setActionError(json.error ?? "Načtení návrhů selhalo");
        return;
      }
      if (json.proposals) setProposals(json.proposals);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [filter]);

  // Always hydrate from admin API (service role) so SSR/RLS gaps never leave the panel empty.
  useEffect(() => {
    void reload();
  }, [reload]);

  async function updateStatus(id: string, status: MarketingProposalStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/marketing/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setActionError(json.error ?? "Aktualizace návrhu selhala");
        return;
      }
      await reload();
    } catch (e) {
      setActionError((e as Error).message);
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
        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={refreshing}
            onClick={() => void reload()}
          >
            {refreshing ? "Načítám…" : "Obnovit"}
          </Button>
        </div>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {actionError}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Žádné návrhy v této kategorii.
          {filter === "pending"
            ? " Orchestrátor zatím nevytvořil nové návrhy ke schválení."
            : null}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Marketer</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Vytvořeno</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="text-right">Priorita</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[280px]">
                    <p className="font-medium leading-snug">{p.title}</p>
                    {p.campaign_type ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.campaign_type}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {MARKETER_LABELS[p.marketer_id] ?? p.marketer_id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.partner_name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString("cs-CZ")
                      : "—"}
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
