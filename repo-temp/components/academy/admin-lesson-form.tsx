"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AcademyCourse } from "@/types/academy";

type Props = {
  courses: Pick<AcademyCourse, "id" | "title">[];
};

export function AdminLessonForm({ courses }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    course_id: courses[0]?.id ?? "",
    slug: "",
    title: "",
    content: "",
    sort_order: 1,
    status: "draft",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/lessons", {
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
      setStatus("Lekce vytvořena.");
      window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  if (!courses.length) {
    return <p className="text-sm text-slate-500">Nejdříve vytvořte kurz.</p>;
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Nová lekce
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Vytvořit lekci</p>
      <select
        required
        value={form.course_id}
        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Slug lekce"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Název lekce"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <textarea
        placeholder="Obsah lekce"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={4}
      />
      <div className="flex flex-wrap gap-3">
        <input
          type="number"
          min={1}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
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
