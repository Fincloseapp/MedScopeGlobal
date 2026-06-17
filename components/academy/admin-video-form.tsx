"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminVideoForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", storage_path: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Video záznam vytvořen (pending upload).");
      setForm({ title: "", storage_path: "" });
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
        + Nové video
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Registrovat video asset</p>
      <input
        required
        placeholder="Název videa"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        placeholder="Storage path (např. academy/videos/lekce-1.mp4)"
        value={form.storage_path}
        onChange={(e) => setForm({ ...form, storage_path: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <p className="text-xs text-slate-500">
        Upload do Supabase Storage bude doplněn ve fázi 6 — zatím stub záznamu.
      </p>
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
