"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export type TextbookChapter = {
  id: string;
  title: string;
  summary: string;
  content_html: string;
  status: "draft" | "published";
};

type TextbookRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  metadata: Record<string, unknown>;
};

function parseChapters(metadata: Record<string, unknown>): TextbookChapter[] {
  const raw = metadata.chapters;
  if (!Array.isArray(raw)) return [];
  return raw.map((ch, i) => {
    const c = ch as Record<string, unknown>;
    return {
      id: String(c.id ?? `ch_${i + 1}`),
      title: String(c.title ?? `Kapitola ${i + 1}`),
      summary: String(c.summary ?? ""),
      content_html: String(c.content_html ?? c.content ?? ""),
      status: c.status === "published" ? "published" : "draft",
    };
  });
}

export function AdminTextbookEditor({ textbook }: { textbook: TextbookRow }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [chapters, setChapters] = useState<TextbookChapter[]>(() =>
    parseChapters(textbook.metadata ?? {})
  );
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");

  const active = chapters.find((c) => c.id === activeId) ?? chapters[0];

  function addChapter() {
    const id = `ch_${Date.now()}`;
    const next: TextbookChapter = {
      id,
      title: `Kapitola ${chapters.length + 1}`,
      summary: "",
      content_html: "<p></p>",
      status: "draft",
    };
    setChapters([...chapters, next]);
    setActiveId(id);
  }

  function updateChapter(id: string, patch: Partial<TextbookChapter>) {
    setChapters((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function save(publish = false) {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/academy/textbooks/${textbook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          metadata: { chapters },
          status: publish ? "published" : textbook.status,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? `Chyba (${res.status})`);
        return;
      }
      setStatus(publish ? "Učebnice publikována." : "Kapitoly uloženy.");
      if (publish) window.location.reload();
    } catch {
      setStatus("Síťová chyba");
    } finally {
      setLoading(false);
    }
  }

  async function publishChapter(id: string) {
    setLoading(true);
    setStatus(null);
    let nextChapters: TextbookChapter[] = [];
    setChapters((list) => {
      nextChapters = list.map((c) =>
        c.id === id ? { ...c, status: "published" as const } : c
      );
      return nextChapters;
    });
    try {
      const res = await fetch(`/api/academy/textbooks/${textbook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ metadata: { chapters: nextChapters } }),
      });
      if (res.ok) setStatus("Kapitola publikována.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Upravit kapitoly
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-[#021d33]">
        Editor učebnice: {textbook.title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setActiveId(ch.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              ch.id === active?.id
                ? "border-[#005B96] bg-white text-[#005B96]"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {ch.title}
            {ch.status === "published" ? " ✓" : ""}
          </button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={addChapter}>
          + Kapitola
        </Button>
      </div>

      {active ? (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <input
            value={active.title}
            onChange={(e) => updateChapter(active.id, { title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            placeholder="Název kapitoly"
          />
          <input
            value={active.summary}
            onChange={(e) => updateChapter(active.id, { summary: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Krátký souhrn"
          />
          <RichTextEditor
            value={active.content_html}
            onChange={(html) => updateChapter(active.id, { content_html: html })}
          />
          {active.status !== "published" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => publishChapter(active.id)}
              disabled={loading}
            >
              Publikovat kapitolu
            </Button>
          ) : (
            <span className="text-xs text-green-700">Kapitola publikována</span>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => save(false)} disabled={loading}>
          {loading ? "Ukládám…" : "Uložit kapitoly"}
        </Button>
        <Button type="button" size="sm" onClick={() => save(true)} disabled={loading}>
          Publikovat učebnici
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Zavřít
        </Button>
        {status ? <span className="text-sm text-slate-600">{status}</span> : null}
      </div>
    </div>
  );
}
