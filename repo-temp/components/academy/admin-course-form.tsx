"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AcademyCourse } from "@/types/academy";

type Props = {
  courses?: Pick<AcademyCourse, "id" | "title">[];
};

export function AdminCourseForm({ courses: _courses }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    level: "beginner",
    status: "draft",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/courses", {
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
      setStatus("Kurz vytvořen.");
      setForm({ slug: "", title: "", description: "", level: "beginner", status: "draft" });
      window.location.reload();
    } catch {
      setStatus("Síťová chyba — přihlaste se v /admin/login");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Nový kurz
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Vytvořit kurz</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Slug (např. uvod-do-anatomie)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Název kurzu"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        placeholder="Popis"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={2}
      />
      <div className="flex flex-wrap gap-3">
        <select
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="beginner">Začátečník</option>
          <option value="intermediate">Středně pokročilý</option>
          <option value="advanced">Pokročilý</option>
        </select>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="draft">Koncept</option>
          <option value="published">Publikováno</option>
        </select>
        <Button type="submit" disabled={loading}>
          {loading ? "Ukládám…" : "Uložit"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Zrušit
        </Button>
      </div>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
