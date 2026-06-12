"use client";

import { useEffect, useState } from "react";
import type { PublicAdCampaign, PublicTopic } from "@/lib/queries/verejnost";
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

const AD_TYPES = [
  { value: "inline", label: "V textu článku" },
  { value: "banner", label: "Horní banner" },
  { value: "sidebar", label: "Postranní panel" },
  { value: "footer", label: "Patička" },
];

const TOPICS: { value: PublicTopic; label: string }[] = [
  { value: "zivotni-styl", label: "Životní styl" },
  { value: "nemoci", label: "Nemoci" },
  { value: "prevence", label: "Prevence" },
  { value: "rozhovory", label: "Rozhovory" },
];

type FormState = {
  title: string;
  body_html: string;
  type: string;
  target_topics: PublicTopic[];
  affiliate_url: string;
  cta_text: string;
  frequency: number;
  active: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  body_html: "",
  type: "inline",
  target_topics: [],
  affiliate_url: "",
  cta_text: "",
  frequency: 1,
  active: true,
});

export function AdEditor({
  editing,
  onSaved,
  onCancel,
}: {
  editing: PublicAdCampaign | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        body_html: editing.body_html ?? "",
        type: editing.type ?? "inline",
        target_topics: (editing.target_topics ?? []) as PublicTopic[],
        affiliate_url: editing.affiliate_url ?? "",
        cta_text: editing.cta_text ?? "",
        frequency: editing.frequency ?? 1,
        active: editing.active,
      });
    } else {
      setForm(emptyForm());
    }
    setError(null);
  }, [editing]);

  function toggleTopic(topic: PublicTopic) {
    setForm((f) => ({
      ...f,
      target_topics: f.target_topics.includes(topic)
        ? f.target_topics.filter((t) => t !== topic)
        : [...f.target_topics, topic],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        affiliate_url: form.affiliate_url || null,
        cta_text: form.cta_text || null,
        ...(editing ? { id: editing.id } : {}),
      };
      const res = await fetch("/api/admin/ads-public", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Uložení selhalo");
      onSaved();
      if (!editing) setForm(emptyForm());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border bg-white p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">
          {editing ? "Upravit kampaň" : "Nová veřejná kampaň"}
        </h2>
        <p className="text-sm text-muted-foreground">public_ad_campaigns · sekce /verejnost</p>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="ad-title">Název</Label>
        <Input
          id="ad-title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Partner — prevence a wellness"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="ad-body">HTML obsah</Label>
        <Textarea
          id="ad-body"
          rows={4}
          value={form.body_html}
          onChange={(e) => setForm((f) => ({ ...f, body_html: e.target.value }))}
          placeholder="<p>Krátký popis partnera…</p>"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-link">Affiliate URL</Label>
        <Input
          id="ad-link"
          value={form.affiliate_url}
          onChange={(e) => setForm((f) => ({ ...f, affiliate_url: e.target.value }))}
          placeholder="https://partner.cz"
        />
      </div>

      <div className="space-y-2">
        <Label>Typ zobrazení</Label>
        <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AD_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-cta">CTA text</Label>
        <Input
          id="ad-cta"
          value={form.cta_text}
          onChange={(e) => setForm((f) => ({ ...f, cta_text: e.target.value }))}
          placeholder="Více informací"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ad-freq">Frekvence (1–10)</Label>
        <Input
          id="ad-freq"
          type="number"
          min={1}
          max={10}
          value={form.frequency}
          onChange={(e) => setForm((f) => ({ ...f, frequency: Number(e.target.value) }))}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label>Cílová témata (prázdné = vše)</Label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleTopic(t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                form.target_topics.includes(t.value)
                  ? "bg-[#005B96] text-white"
                  : "border border-slate-200 text-slate-600 hover:border-[#005B96]/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
        <Label>Aktivní</Label>
      </div>

      {error ? <p className="md:col-span-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Ukládám…" : editing ? "Uložit změny" : "Vytvořit kampaň"}
        </Button>
        {editing ? (
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            Zrušit úpravu
          </Button>
        ) : null}
      </div>
    </form>
  );
}
