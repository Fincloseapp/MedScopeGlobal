"use client";

import type { CategoryPerformance } from "@/lib/queries/marketing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AUDIENCE_LABELS: Record<string, string> = {
  public: "Veřejnost",
  student: "Studenti",
  pro: "Pro / B2B",
};

export function AdPerformanceByCategory({ categories }: { categories: CategoryPerformance[] }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#021d33]">Výkon podle kategorie</h2>
        <p className="text-sm text-muted-foreground">
          Agregované imprese, kliky a CTR podle tématu / B2B kategorie.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Zatím žádná data o výkonu podle kategorií.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategorie</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead className="text-right">Kampaně</TableHead>
                <TableHead className="text-right">Imprese</TableHead>
                <TableHead className="text-right">Kliky</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((row) => (
                <TableRow key={`${row.audience}:${row.category}`}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {AUDIENCE_LABELS[row.audience] ?? row.audience}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.campaigns}</TableCell>
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
