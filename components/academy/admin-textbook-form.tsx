"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminTextbookForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content_ref: "",
    chaptersJson: JSON.stringify(
      [
        { title: "1. Úvod", summary: "Základní pojmy." },
        { title: "2. Kapitola", summary: "Obsah kapitoly." },
      ],
      null,
      2
    ),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      let chapters: unknown;
      try {
        chapters = JSON.parse(form.chaptersJson);
      } catch {
        setStatus("Neplatný JSON kapitol.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/academy/textbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          content_ref: form.content_ref || null,
          metadata: { chapters },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Učebnice vytvořena.");
      window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Nová učebnice
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Vytvořit učebnici</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Název"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <input
        placeholder="Content ref (URL nebo storage path)"
        value={form.content_ref}
        onChange={(e) => setForm({ ...form, content_ref: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <textarea
        value={form.chaptersJson}
        onChange={(e) => setForm({ ...form, chaptersJson: e.target.value })}
        className="h-32 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Ukládám…" : "Vytvořit"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Zrušit
        </Button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
