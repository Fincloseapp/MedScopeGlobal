import Image from "next/image";
import Link from "next/link";
import { NewsMagazineCard } from "@/components/articles/news-article-card";
import { VitascopeMastheadBanner } from "@/components/articles/vitascope-mark";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { VITASCOPE, VITASCOPE_DESK_LOGO, VITASCOPE_TRACK_LOGO } from "@/lib/brand/vitascope";
import { NEWS_DESKS, type NewsDeskId } from "@/lib/v271/news-desks";

export function MagazineListing({
  articles,
  activeDesk,
}: {
  articles: DisplayArticle[];
  activeDesk: NewsDeskId | null;
}) {
  const featured = articles[0];
  const rest = articles.slice(1);
  const desk = NEWS_DESKS.find((item) => item.id === (activeDesk ?? "clanky")) ?? NEWS_DESKS[3]!;

  return (
    <div className="v20-articles mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <VitascopeMastheadBanner desk={activeDesk} title={desk.label} blurb={desk.blurb} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Redakční značka {VITASCOPE.name} · {VITASCOPE.tagline}
        </p>
        <Link href="/articles/archiv" className="text-sm font-medium text-primary hover:underline">
          Archiv →
        </Link>
      </div>

      <nav aria-label="Oblasti zpravodajství" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
            !activeDesk ? "border-[#005B96] bg-[#005B96] text-white" : "bg-white text-slate-700"
          }`}
        >
          Vše
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
        <Link
          href="/articles?med_track=priprava"
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
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
          Příprava LF
        </Link>
        <Link
          href="/articles?med_track=studium"
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
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
          Studium medicíny
        </Link>
      </nav>

      {featured ? (
        <div className="mt-8">
          <NewsMagazineCard article={featured} featured />
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-500">
          V této oblasti zatím nejsou články, které by splnily redakční pravidla zobrazení.
        </p>
      )}

      {rest.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <NewsMagazineCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}

      <p className="mt-10 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950">
        Texty slouží ke vzdělávání. Nenahrazují vyšetření ani individuální lékařskou radu. U
        každého článku je uvedena redakční jednotka a nezávislá kontrola; primární zdroje
        redakce nevymýšlí.
      </p>
    </div>
  );
}
