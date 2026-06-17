"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipTapRenderer } from "@/components/academy/tiptap-renderer";

export type TextbookChapter = {
  slug: string;
  title: string;
  image_url?: string;
  content_json?: Record<string, unknown>;
  html?: string;
};

type Props = {
  textbookSlug: string;
  textbookTitle: string;
  chapters: TextbookChapter[];
};

export function TextbookChapterReader({ textbookSlug, textbookTitle, chapters }: Props) {
  const [index, setIndex] = useState(0);
  const chapter = chapters[index];

  const progressPct = useMemo(() => {
    if (!chapters.length) return 0;
    return Math.round(((index + 1) / chapters.length) * 100);
  }, [index, chapters.length]);

  if (!chapter) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Tato učebnice zatím nemá kapitoly.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {textbookTitle} · kapitola {index + 1} / {chapters.length}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-[#005B96] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-slate-500">{progressPct}%</span>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{chapter.title}</h2>

        {chapter.image_url ? (
          <img
            src={chapter.image_url}
            alt={chapter.title}
            className="mt-4 w-full rounded-xl border border-slate-100 object-cover"
          />
        ) : null}

        <div className="mt-6">
          {chapter.content_json ? (
            <TipTapRenderer doc={chapter.content_json} />
          ) : chapter.html ? (
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: chapter.html }} />
          ) : (
            <p className="text-sm text-slate-500">Obsah kapitoly se připravuje.</p>
          )}
        </div>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Předchozí
        </Button>
        <Link href="/academy/textbooks" className="text-sm text-[#005B96] hover:underline">
          Všechny učebnice
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index >= chapters.length - 1}
          onClick={() => setIndex((i) => Math.min(chapters.length - 1, i + 1))}
        >
          Další
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Postup: kapitola <code>{chapter.slug}</code> ·{" "}
        <Link href={`/academy/textbooks/${textbookSlug}?chapter=${chapter.slug}`} className="hover:underline">
          odkaz na kapitolu
        </Link>
      </p>
    </div>
  );
}
