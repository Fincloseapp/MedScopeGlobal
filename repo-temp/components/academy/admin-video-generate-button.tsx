"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type LessonOption = { id: string; title: string; slug: string };

export function AdminVideoGenerateButton({ lessons }: { lessons: LessonOption[] }) {
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function generate() {
    if (!lessonId) {
      setStatus("Vyberte lekci.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/academy/ai/generate-video", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        result?: { video_asset_id?: string };
      };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus(data.message ?? `Video vygenerováno (asset: ${data.result?.video_asset_id ?? "—"})`);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  if (!lessons.length) return null;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-slate-500">AI generovat video pro lekci</label>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" onClick={generate} disabled={loading} variant="secondary">
        <Sparkles className="mr-1 h-4 w-4" />
        {loading ? "Generuji…" : "AI video"}
      </Button>
      {status ? <p className="w-full text-xs text-slate-600">{status}</p> : null}
    </div>
  );
}
