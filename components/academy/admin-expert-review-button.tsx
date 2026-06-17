"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  courseId?: string;
  lessonId?: string;
  quizId?: string;
};

export function AdminExpertReviewButton({ courseId, lessonId, quizId }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [autoPublish, setAutoPublish] = useState(false);

  async function runReview() {
    setLoading(true);
    setStatus(null);
    try {
      const payload: Record<string, unknown> = { auto_publish: autoPublish, min_score: 75 };
      if (courseId) payload.course_id = courseId;
      if (lessonId) payload.lesson_id = lessonId;
      if (quizId) payload.quiz_id = quizId;

      const createRes = await fetch("/api/academy/ai/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ task_type: "expert-review", payload }),
      });
      const created = (await createRes.json()) as { ok?: boolean; task?: { id: string }; error?: string };
      if (!createRes.ok || !created.ok || !created.task?.id) {
        setStatus(created.error ?? "Nepodařilo se zařadit revizi");
        return;
      }

      const dispatchRes = await fetch("/api/academy/ai/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ task_id: created.task.id }),
      });
      const dispatched = (await dispatchRes.json()) as {
        ok?: boolean;
        message?: string;
        result?: { auto_published?: boolean; approved?: boolean };
      };
      if (dispatched.ok) {
        const pub = dispatched.result?.auto_published
          ? " · auto-publikováno"
          : dispatched.result?.approved
            ? " · schváleno (bez auto-publish)"
            : "";
        setStatus(`Expertní revize dokončena${pub} — viz AI → Experti`);
      } else {
        setStatus(dispatched.message ?? "Chyba");
      }
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={autoPublish}
          onChange={(e) => setAutoPublish(e.target.checked)}
          disabled={loading}
        />
        Auto-publikovat po schválení
      </label>
      <Button type="button" size="sm" variant="outline" onClick={runReview} disabled={loading}>
        {loading ? "Revize…" : "AI revize"}
      </Button>
      {status ? <span className="text-xs text-slate-500">{status}</span> : null}
    </div>
  );
}
