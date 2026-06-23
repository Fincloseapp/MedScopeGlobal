"use client";

import type { PublicAdCampaign } from "@/lib/queries/verejnost";
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

export function AdTable({
  campaigns,
  onEdit,
  onToggle,
  onDelete,
  busy,
}: {
  campaigns: PublicAdCampaign[];
  onEdit: (campaign: PublicAdCampaign) => void;
  onToggle: (campaign: PublicAdCampaign) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
}) {
  if (campaigns.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Zatím žádné kampaně. Přidejte první reklamu pro sekci /verejnost.
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
              <TableCell className="max-w-[140px] truncate text-xs text-muted-foreground">
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
