"use client";

import type { MarketerActivityLog } from "@/lib/queries/marketing";
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
  coordinator: "Koordinátor",
};

export function MarketerActivityTable({
  activity,
  byMarketer,
}: {
  activity: MarketerActivityLog[];
  byMarketer: Record<string, number>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#021d33]">Aktivita AI marketérů</h2>
          <p className="text-sm text-muted-foreground">
            Poslední akce v logu marketer_activity_log (7 dní).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byMarketer).map(([id, count]) => (
            <div key={id} className="rounded-lg border bg-white px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">{MARKETER_LABELS[id] ?? id}</span>{" "}
              <span className="font-semibold tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {activity.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Zatím žádná aktivita marketérů.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Čas</TableHead>
                <TableHead>Marketer</TableHead>
                <TableHead>Akce</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("cs-CZ")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {MARKETER_LABELS[row.marketer_id] ?? row.marketer_id}
                  </TableCell>
                  <TableCell className="font-medium">{row.action}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                    {formatDetails(row.details)}
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

function formatDetails(details: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) return "—";
  try {
    return JSON.stringify(details);
  } catch {
    return "—";
  }
}
