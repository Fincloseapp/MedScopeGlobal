"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type LessonOption = {
  id: string;
  title: string;
  slug: string;
  video_asset_id: string | null;
};

type Props = {
  videoId: string;
  videoTitle: string;
  lessons: LessonOption[];
  linkedLessonId: string | null;
};

export function AdminVideoLessonLink({ videoId, videoTitle, lessons, linkedLessonId }: Props) {
  const [open, setOpen] = useState(false);
  const [lessonId, setLessonId] = useState(linkedLessonId ?? "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function linkLesson() {
    if (!lessonId) {
      setStatus("Vyberte lekci.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/academy/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ video_asset_id: videoId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus("Video propojeno s lekcí.");
      window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  async function unlink() {
    if (!linkedLessonId) return;
    setLoading(true);
    try {
      await fetch(`/api/academy/lessons/${linkedLessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ video_asset_id: null }),
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {linkedLessonId ? "Změnit lekci" : "Propojit s lekcí"}
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-600">Propojit „{videoTitle}“ s lekcí</p>
      <select
        value={lessonId}
        onChange={(e) => setLessonId(e.target.value)}
        className="mt-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
      >
        <option value="">— Vyberte lekci —</option>
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title} ({l.slug})
            {l.video_asset_id === videoId ? " ✓" : ""}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={linkLesson} disabled={loading}>
          {loading ? "Ukládám…" : "Propojit"}
        </Button>
        {linkedLessonId ? (
          <Button type="button" size="sm" variant="outline" onClick={unlink} disabled={loading}>
            Odpojit
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Zavřít
        </Button>
      </div>
      {status ? <p className="mt-2 text-xs text-slate-600">{status}</p> : null}
    </div>
  );
}
