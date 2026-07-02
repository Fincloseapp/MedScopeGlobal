"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdsOverview, MarketingProposal, MarketingProposalStatus } from "@/lib/queries/marketing";
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
import { Textarea } from "@/components/ui/textarea";

const MARKETER_LABELS: Record<string, string> = {
  public: "Veřejnost",
  students: "Studenti",
  pro: "Pro / B2B",
};

export function CoordinatorDecisions({
  coordinator,
  onUpdated,
}: {
  coordinator: AdsOverview["coordinator"];
  onUpdated: () => Promise<void>;
}) {
  const [pending, setPending] = useState<MarketingProposal[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/admin/marketing/proposals?status=pending&limit=50");
    const json = (await res.json()) as { ok?: boolean; proposals?: MarketingProposal[] };
    if (json.ok && json.proposals) setPending(json.proposals);
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function decide(id: string, status: MarketingProposalStatus) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/manual-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposal_id: id,
          proposal_status: status,
          coordinator_notes: notes[id]?.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json.ok) {
        await loadPending();
        await onUpdated();
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#021d33]">Rozhodnutí koordinátora</h2>
        <p className="text-sm text-muted-foreground">
          Schvalování a zamítání návrhů od 3 AI marketérů.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Čeká na rozhodnutí", value: coordinator.pending },
          { label: "Schváleno tento týden", value: coordinator.autoApprovedWeek },
          { label: "Zamítnuto tento týden", value: coordinator.autoRejectedWeek },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {c.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-[#021d33]">{c.value}</p>
          </div>
        ))}
      </div>

      {pending.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Žádné návrhy nečekají na schválení.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Marketer</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Priorita</TableHead>
                <TableHead>Poznámka</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[180px] font-medium">{p.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {MARKETER_LABELS[p.marketer_id] ?? p.marketer_id}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.partner_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.priority}</TableCell>
                  <TableCell className="min-w-[160px]">
                    <Textarea
                      rows={2}
                      placeholder="Poznámka koordinátora…"
                      value={notes[p.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                      className="text-xs"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === p.id}
                        onClick={() => decide(p.id, "approved")}
                      >
                        Schválit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === p.id}
                        onClick={() => decide(p.id, "rejected")}
                      >
                        Zamítnout
                      </Button>
                    </div>
                    {p.traffic_score != null ? (
                      <Badge variant="secondary" className="mt-1">
                        skóre {p.traffic_score}
                      </Badge>
                    ) : null}
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
