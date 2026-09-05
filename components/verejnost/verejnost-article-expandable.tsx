"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { articleTopicLabel, verejnostDateLabel } from "@/lib/verejnost/helpers";
import { cn } from "@/lib/utils";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";

export function VerejnostArticleExpandable({
  article,
  coverUrl,
}: {
  article: DisplayArticle;
  coverUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const uiLocale = article.displayLocale ?? "cs";
  const chrome = getVerejnostChrome(uiLocale);
  const dateLabel = verejnostDateLabel(article, uiLocale);
  const topicLabel = articleTopicLabel(article, uiLocale);
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
          <Image src={coverUrl} alt="" fill className="object-cover" sizes="50vw" loading="lazy" />
          {isInterview ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#021d33]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {chrome.interviewBadge}
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
            {open ? chrome.hideArticle : chrome.expandArticle}
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
            <p className="text-sm text-slate-500">{chrome.contentComing}</p>
          )}
          <Link
            href={localizePublicHref(`/verejnost/clanky/${article.slug}`, uiLocale)}
            className="mt-4 inline-block text-sm font-medium text-[#005B96] hover:underline"
          >
            {chrome.openFullArticle}
          </Link>
          <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-950">
            {chrome.articleDisclaimer}
          </p>
        </div>
      ) : null}
    </article>
  );
}
