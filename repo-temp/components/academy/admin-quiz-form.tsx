"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AcademyCourse } from "@/types/academy";

type Props = {
  courses: Pick<AcademyCourse, "id" | "title">[];
};

export function AdminQuizForm({ courses }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    course_id: courses[0]?.id ?? "",
    title: "",
    passing_score: 70,
    status: "draft",
    question_text: "",
    options: ["", "", ""],
    correct_index: 0,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const options = form.options
      .filter((o) => o.trim())
      .map((label, i) => ({ label, value: String(i) }));

    const payload = {
      course_id: form.course_id,
      title: form.title,
      passing_score: form.passing_score,
      status: form.status,
      questions: form.question_text.trim()
        ? [
            {
              question_text: form.question_text,
              question_type: "multiple_choice" as const,
              options,
              correct_answer: { value: String(form.correct_index) },
              sort_order: 1,
            },
          ]
        : [],
    };

    try {
      const res = await fetch("/api/academy/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Kvíz vytvořen.");
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
        + Nový kvíz
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-[#021d33]">Vytvořit kvíz</p>
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
      <input
        required
        placeholder="Název kvízu"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        placeholder="První otázka (volitelné)"
        value={form.question_text}
        onChange={(e) => setForm({ ...form, question_text: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      {form.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name="correct"
            checked={form.correct_index === i}
            onChange={() => setForm({ ...form, correct_index: i })}
          />
          <input
            placeholder={`Možnost ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const options = [...form.options];
              options[i] = e.target.value;
              setForm({ ...form, options });
            }}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <input
          type="number"
          min={0}
          max={100}
          value={form.passing_score}
          onChange={(e) => setForm({ ...form, passing_score: Number(e.target.value) })}
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
