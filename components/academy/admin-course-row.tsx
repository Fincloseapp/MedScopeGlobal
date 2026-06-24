"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AcademyCourse } from "@/types/academy";
import { AdminExpertReviewButton } from "@/components/academy/admin-expert-review-button";

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikováno",
  archived: "Archiv",
};

type Props = {
  course: Pick<AcademyCourse, "id" | "title" | "slug" | "status" | "level">;
};

export function AdminCourseRow({ course }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: course.title,
    status: course.status,
    level: course.level,
  });

  async function save() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/academy/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setEditing(false);
      window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setForm((f) => ({ ...f, status: "published" }));
    setLoading(true);
    try {
      const res = await fetch(`/api/academy/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: "published" }),
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
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as AcademyCourse["level"] })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="beginner">Začátečník</option>
              <option value="intermediate">Středně pokročilý</option>
              <option value="advanced">Pokročilý</option>
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as AcademyCourse["status"] })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="draft">Koncept</option>
              <option value="published">Publikováno</option>
              <option value="archived">Archiv</option>
            </select>
            <Button type="button" size="sm" onClick={save} disabled={loading}>
              Uložit
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Zrušit
            </Button>
            {status ? <span className="text-sm text-red-600">{status}</span> : null}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium text-[#021d33]">{course.title}</td>
      <td className="px-4 py-3 text-slate-600">
        <Link href={`/academy/courses/${course.slug}`} className="hover:underline">
          {course.slug}
        </Link>
      </td>
      <td className="px-4 py-3">{STATUS_LABELS[course.status] ?? course.status}</td>
      <td className="px-4 py-3 text-slate-600">{course.level}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            Upravit
          </Button>
          {course.status !== "published" ? (
            <Button type="button" size="sm" onClick={publish} disabled={loading}>
              Publikovat
            </Button>
          ) : null}
          <AdminExpertReviewButton courseId={course.id} />
        </div>
      </td>
    </tr>
  );
}
