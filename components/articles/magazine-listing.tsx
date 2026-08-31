import Image from "next/image";
import Link from "next/link";
import { NewsMagazineCard } from "@/components/articles/news-article-card";
import { VitascopeMastheadBanner } from "@/components/articles/vitascope-mark";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import {
  EDITORIAL_PILLARS,
  getMagazineCopy,
  getMagazineListingCopy,
  MAGAZINE,
} from "@/lib/brand/magazine";
import { VITASCOPE_DESK_LOGO, VITASCOPE_TRACK_LOGO } from "@/lib/brand/vitascope";
import { NEWS_DESKS, type NewsDeskId } from "@/lib/v271/news-desks";

export function MagazineListing({
  articles,
  activeDesk,
  locale = "cs",
}: {
  articles: DisplayArticle[];
  activeDesk: NewsDeskId | null;
  locale?: string;
}) {
  const featured = articles[0];
  const rest = articles.slice(1);
  const desk = NEWS_DESKS.find((item) => item.id === (activeDesk ?? "clanky")) ?? NEWS_DESKS[3]!;
  const copy = getMagazineListingCopy(locale);
  const brand = getMagazineCopy(locale);
  const isCs = !locale || locale === "cs" || locale.startsWith("cs");

  return (
    <div className="v20-articles mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <VitascopeMastheadBanner
        desk={activeDesk}
        title={activeDesk ? desk.label : MAGAZINE.name}
        blurb={activeDesk ? desk.blurb : copy.intro}
      />

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              {brand.eyebrow}
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{brand.tagline}</p>
          </div>
          <Link href="/articles/archiv" className="text-sm font-medium text-primary hover:underline">
            {copy.archive}
          </Link>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {EDITORIAL_PILLARS.filter((pillar) => pillar.id !== "seniors").map((pillar) => (
            <li
              key={pillar.id}
              className="rounded-xl border border-slate-100 bg-[#f7fafc] px-3 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005B96]">
                {pillar.share}%
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#021d33]">
                {isCs ? pillar.label.cs : pillar.label.en}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <nav aria-label={copy.desksLabel} className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {copy.desksLabel}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/articles"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              !activeDesk ? "border-[#005B96] bg-[#005B96] text-white" : "bg-white text-slate-700"
            }`}
          >
            {copy.all}
          </Link>
          {NEWS_DESKS.map((item) => (
            <Link
              key={item.id}
              href={item.id === "clanky" ? "/articles?desk=clanky" : `/articles?desk=${item.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                activeDesk === item.id
                  ? "border-[#005B96] bg-[#005B96] text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              <span className="relative h-5 w-5 overflow-hidden rounded-full bg-[#050b1d]">
                <Image
                  src={VITASCOPE_DESK_LOGO[item.id]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <nav aria-label={copy.studyLabel} className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {copy.studyLabel}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/articles?med_track=priprava"
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 hover:border-[#005B96]/40 hover:text-[#005B96]"
          >
            <span className="relative h-5 w-5 overflow-hidden rounded-full bg-[#050b1d]">
              <Image
                src={VITASCOPE_TRACK_LOGO.priprava}
                alt=""
                fill
                className="object-cover"
                sizes="20px"
              />
            </span>
            {copy.prep}
          </Link>
          <Link
            href="/articles?med_track=studium"
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 hover:border-[#005B96]/40 hover:text-[#005B96]"
          >
            <span className="relative h-5 w-5 overflow-hidden rounded-full bg-[#050b1d]">
              <Image
                src={VITASCOPE_TRACK_LOGO.studium}
                alt=""
                fill
                className="object-cover"
                sizes="20px"
              />
            </span>
            {copy.study}
          </Link>
        </div>
      </nav>

      {featured ? (
        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {copy.featured}
          </p>
          <NewsMagazineCard article={featured} featured />
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">{copy.empty}</p>
      )}

      {rest.length > 0 ? (
        <div className="mt-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {copy.more}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <NewsMagazineCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-10 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950">
        {copy.legal}
      </p>
    </div>
  );
}
