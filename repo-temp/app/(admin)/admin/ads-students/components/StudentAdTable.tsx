"use client";

import type { StudentAdCampaign } from "@/lib/queries/marketing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRACK_LABELS: Record<string, string> = {
  priprava: "Příprava LF",
  studium: "Studium",
};

export function StudentAdTable({
  campaigns,
  onEdit,
  onToggle,
  onDelete,
  busy,
}: {
  campaigns: StudentAdCampaign[];
  onEdit: (campaign: StudentAdCampaign) => void;
  onToggle: (campaign: StudentAdCampaign) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}) {
  if (campaigns.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Zatím žádné studentské kampaně. Přidejte první reklamu pro /articles?med_track=…
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Název</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Ročníky</TableHead>
            <TableHead>Témata</TableHead>
            <TableHead>Stav</TableHead>
            <TableHead className="text-right">Imprese</TableHead>
            <TableHead className="text-right">Kliky</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.title}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.type}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {c.med_tracks?.length
                  ? c.med_tracks.map((t) => TRACK_LABELS[t] ?? t).join(", ")
                  : "vše"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {c.study_years?.length ? c.study_years.join(", ") : "vše"}
              </TableCell>
              <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                {c.target_topics?.length ? c.target_topics.join(", ") : "vše"}
              </TableCell>
              <TableCell>
                <Badge variant={c.active ? "default" : "secondary"}>
                  {c.active ? "Aktivní" : "Neaktivní"}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{c.impressions ?? 0}</TableCell>
              <TableCell className="text-right tabular-nums">{c.clicks ?? 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onEdit(c)}>
                    Upravit
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onToggle(c)}>
                    {c.active ? "Vypnout" : "Zapnout"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => onDelete(c.id)}
                  >
                    Smazat
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
