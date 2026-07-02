"use client";

import { useCallback, useEffect, useState } from "react";
import type { ManualAdAudience, ManualAdPlacement, ManualAdZone } from "@/lib/queries/marketing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AUDIENCES: { value: ManualAdAudience; label: string }[] = [
  { value: "public", label: "Veřejnost" },
  { value: "student", label: "Studenti" },
  { value: "pro", label: "Pro / B2B" },
];

const ZONES: { value: ManualAdZone; label: string }[] = [
  { value: "header", label: "Header" },
  { value: "sidebar", label: "Sidebar" },
  { value: "inline", label: "Inline" },
  { value: "footer", label: "Footer" },
  { value: "article", label: "Článek" },
  { value: "custom_path", label: "Vlastní cesta" },
];

type FormState = {
  audience: ManualAdAudience;
  placement_zone: ManualAdZone;
  target_path: string;
  campaign_id: string;
  html: string;
  active: boolean;
  priority: number;
};

const emptyForm = (): FormState => ({
  audience: "public",
  placement_zone: "inline",
  target_path: "/*",
  campaign_id: "",
  html: "",
  active: true,
  priority: 50,
});

export function ManualAdInsert({ onChanged }: { onChanged: () => Promise<void> }) {
  const [placements, setPlacements] = useState<ManualAdPlacement[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/manual-ads");
    const json = (await res.json()) as { ok?: boolean; placements?: ManualAdPlacement[] };
    if (json.ok && json.placements) setPlacements(json.placements);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(placement: ManualAdPlacement) {
    setEditingId(placement.id);
    setForm({
      audience: placement.audience,
      placement_zone: placement.placement_zone,
      target_path: placement.target_path,
      campaign_id: placement.campaign_id ?? "",
      html: placement.html,
      active: placement.active,
      priority: placement.priority,
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.html.trim()) {
      setError("HTML obsah je povinný.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const payload = {
        audience: form.audience,
        placement_zone: form.placement_zone,
        target_path: form.target_path.trim() || "/*",
        campaign_id: form.campaign_id.trim() || null,
        html: form.html,
        active: form.active,
        priority: form.priority,
      };

      const res = await fetch("/api/admin/manual-ads", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Uložení selhalo");
        return;
      }

      resetForm();
      await load();
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Smazat tento ruční placement?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/manual-ads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (editingId === id) resetForm();
      await load();
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleToggle(placement: ManualAdPlacement) {
    setBusy(true);
    try {
      await fetch("/api/admin/manual-ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: placement.id, active: !placement.active }),
      });
      await load();
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#021d33]">Ruční vkládání reklam</h2>
        <p className="text-sm text-muted-foreground">
          ManualAdInserter — placement podle audience, zóny a cílové cesty.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select
              value={form.audience}
              onValueChange={(v) => setForm((f) => ({ ...f, audience: v as ManualAdAudience }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zóna</Label>
            <Select
              value={form.placement_zone}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, placement_zone: v as ManualAdZone }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((z) => (
                  <SelectItem key={z.value} value={z.value}>
                    {z.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_path">Cílová cesta</Label>
            <Input
              id="target_path"
              value={form.target_path}
              onChange={(e) => setForm((f) => ({ ...f, target_path: e.target.value }))}
              placeholder="/* nebo /leky/*"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_id">Campaign ID (volitelné)</Label>
            <Input
              id="campaign_id"
              value={form.campaign_id}
              onChange={(e) => setForm((f) => ({ ...f, campaign_id: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorita (1–100)</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              max={100}
              value={form.priority}
              onChange={(e) =>
                setForm((f) => ({ ...f, priority: Number(e.target.value) || 50 }))
              }
            />
          </div>

          <div className="flex items-end gap-3 pb-1">
            <Switch
              checked={form.active}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
            />
            <Label>Aktivní</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="html">HTML reklamy</Label>
          <Textarea
            id="html"
            rows={6}
            value={form.html}
            onChange={(e) => setForm((f) => ({ ...f, html: e.target.value }))}
            placeholder="<div>…</div>"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {editingId ? "Uložit změny" : "Vložit reklamu"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" disabled={busy} onClick={resetForm}>
              Zrušit editaci
            </Button>
          ) : null}
        </div>
      </form>

      {placements.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Zatím žádné ruční placementy.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audience</TableHead>
                <TableHead>Zóna</TableHead>
                <TableHead>Cesta</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="text-right">Priorita</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{p.audience}</TableCell>
                  <TableCell className="text-xs">{p.placement_zone}</TableCell>
                  <TableCell className="max-w-[160px] truncate text-xs">{p.target_path}</TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "secondary"}>
                      {p.active ? "Aktivní" : "Neaktivní"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.priority}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(p)}>
                        Upravit
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleToggle(p)}>
                        {p.active ? "Vyp." : "Zap."}
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                        Smazat
                      </Button>
                    </div>
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
