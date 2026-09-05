"use client";

import { useCallback } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import type { PublicStudentMaterial } from "@/lib/studenti/materials";
import type { MaterialTextContent } from "@/lib/studenti/material-text";
import { PUBLIC_LEGAL_NOTICE, PUBLIC_SOURCE_LABEL } from "@/lib/studenti/materials-anonymize";

type Props = {
  material: PublicStudentMaterial;
  content: MaterialTextContent;
};

export function MaterialTextReader({ material, content }: Props) {
  const blockContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const rocnikLabel =
    material.rocnik !== null && material.rocnik > 0
      ? `${material.rocnik}. ročník`
      : material.category === "recent"
        ? "Naposled přidané"
        : null;

  return (
    <div className="space-y-4" onContextMenu={blockContextMenu}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8a6d32]">
            {PUBLIC_SOURCE_LABEL}
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold text-[#1b1712] sm:text-2xl">
            {material.display_title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {material.subject}
            {rocnikLabel ? ` · ${rocnikLabel}` : ""}
          </p>
        </div>
        <Link
          href="/studenti/materialy"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#1b1712]/18 bg-white px-4 py-2 text-sm font-medium text-[#1b1712] transition hover:border-[#8a6d32]"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět
        </Link>
      </div>

      <article className="rounded-2xl border border-[#1b1712]/12 bg-white/90 shadow-[0_12px_30px_-24px_rgba(27,23,18,0.35)]">
        {content.ok ? (
          <>
            <div className="border-b border-[#1b1712]/10 px-5 py-3 sm:px-8">
              <p className="flex items-center gap-2 text-xs text-[#5c564c]">
                <BookOpen className="h-3.5 w-3.5 text-[#8a6d32]" />
                {content.wordCount.toLocaleString("cs-CZ")} slov · režim čtení
              </p>
            </div>
            <div className="max-h-none overflow-x-hidden px-5 py-6 sm:px-8 sm:py-8">
              {content.kind === "html" ? (
                <div
                  className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[#1b1712] prose-p:leading-relaxed prose-li:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.html }}
                />
              ) : (
                <div className="prose prose-slate max-w-none whitespace-pre-wrap font-serif text-[1.05rem] leading-[1.85] text-[#1a2b3c] prose-p:my-4">
                  {content.text}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="px-5 py-10 text-center sm:px-8">
            <BookOpen className="mx-auto h-8 w-8 text-[#8a6d32]/40" />
            <p className="mt-4 text-sm leading-7 text-[#5c564c]">{content.message}</p>
            <Link
              href="/studenti/materialy"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#8a6d32] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět na materiály
            </Link>
          </div>
        )}
      </article>

      <p className="text-xs leading-6 text-slate-500">{PUBLIC_LEGAL_NOTICE}</p>
    </div>
  );
}
