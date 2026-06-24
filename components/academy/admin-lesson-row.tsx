"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AcademyLessonStatus } from "@/types/academy";

type Props = {
  lesson: {
    id: string;
    title: string;
    slug: string;
    status: string;
    sort_order: number;
  };
};

export function AdminLessonRow({ lesson }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    status: lesson.status,
    sort_order: lesson.sort_order,
  });

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/academy/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (res.ok) window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr className="border-b bg-slate-50 last:border-0">
        <td className="px-4 py-3" colSpan={5}>
          <div className="flex flex-wrap items-end gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="draft">Koncept</option>
              <option value="published">Publikováno</option>
            </select>
            <Button type="button" size="sm" onClick={() => patch(form)} disabled={loading}>
              Uložit
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Zrušit
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium">{lesson.title}</td>
      <td className="px-4 py-3 text-slate-600">{lesson.slug}</td>
      <td className="px-4 py-3">{lesson.status}</td>
      <td className="px-4 py-3">{lesson.sort_order}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            Upravit
          </Button>
          {lesson.status !== "published" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => patch({ status: "published" as AcademyLessonStatus })}
              disabled={loading}
            >
              Publikovat
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
