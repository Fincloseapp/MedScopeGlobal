"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { articleTopicLabel, verejnostDateLabel } from "@/lib/verejnost/helpers";
import { cn } from "@/lib/utils";

export function VerejnostArticleExpandable({
  article,
  coverUrl,
}: {
  article: DisplayArticle;
  coverUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const dateLabel = verejnostDateLabel(article);
  const topicLabel = articleTopicLabel(article);
  const isInterview = article.public_topic === "rozhovory";

  const toggle = () => setOpen((v) => !v);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition",
        open && "shadow-md ring-1 ring-[#005B96]/15"
      )}
    >
      <button
        type="button"
        onClick={toggle}
        className="group w-full text-left"
        aria-expanded={open}
      >
        <div className="relative aspect-[16/10] bg-slate-100">
          <Image src={coverUrl} alt={article.title} fill className="object-cover" sizes="50vw" loading="lazy" />
          {isInterview ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#021d33]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              Rozhovor
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">{topicLabel}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-[#021d33] group-hover:text-[#005B96]">
              {article.title}
            </h3>
            <ChevronDown
              className={cn(
                "mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform",
                open && "rotate-180 text-[#005B96]"
              )}
              aria-hidden
            />
          </div>
          {article.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
          ) : null}
          {dateLabel ? <p className="mt-2 text-xs text-slate-400">{dateLabel}</p> : null}
          <p className="mt-3 text-xs font-medium text-[#005B96]">
            {open ? "Skrýt článek" : "Klikněte pro celý článek"}
          </p>
        </div>
      </button>

      {open ? (
        <div className="border-t border-slate-100 px-5 pb-6 pt-4">
          {article.content ? (
            <div
              className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[#021d33] prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-sm text-slate-500">Obsah článku bude brzy doplněn.</p>
          )}
          <Link
            href={`/verejnost/clanky/${article.slug}`}
            className="mt-4 inline-block text-sm font-medium text-[#005B96] hover:underline"
          >
            Otevřít celý článek na samostatné stránce →
          </Link>
          <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-950">
            Informace slouží k obecnému vzdělávání a nenahrazují konzultaci s lékařem.
          </p>
        </div>
      ) : null}
    </article>
  );
}
