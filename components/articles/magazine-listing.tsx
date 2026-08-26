import Link from "next/link";
import { NewsMagazineCard } from "@/components/articles/news-article-card";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { MAGAZINE } from "@/lib/brand/magazine";
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        {MAGAZINE.name} · {desk.kicker}
      </p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-[#021d33]">{desk.label}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{desk.blurb}</p>
        </div>
        <Link href="/articles/archiv" className="text-sm font-medium text-primary hover:underline">
          Archiv →
        </Link>
      </div>

      <nav aria-label="Oblasti zpravodajství" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full border px-3 py-1.5 text-sm ${
            !activeDesk ? "bg-[#005B96] text-white border-[#005B96]" : "bg-white text-slate-700"
          }`}
        >
          Vše
        </Link>
        {NEWS_DESKS.map((item) => (
          <Link
            key={item.id}
            href={item.id === "clanky" ? "/articles?desk=clanky" : `/articles?desk=${item.id}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              activeDesk === item.id
                ? "bg-[#005B96] text-white border-[#005B96]"
                : "bg-white text-slate-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/articles?med_track=priprava"
          className="rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          Příprava LF
        </Link>
        <Link
          href="/articles?med_track=studium"
          className="rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          Studium medicíny
        </Link>
      </nav>

      {featured ? (
        <div className="mt-8">
          <NewsMagazineCard article={featured} featured />
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cfe1f3] bg-[#f6fbff] px-6 py-10 text-center">
          <p className="font-display text-xl font-semibold text-[#021d33]">
            {MAGAZINE.name} zatím nemá zobrazené články
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            Redakční feed se připravuje. Mezitím můžete vést wellness deník v MediFlow, prozkoumat VIP
            protokoly nebo podpořit redakci tringeltem u publikovaných textů.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/mediflow"
              className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
            >
              Otevřít MediFlow
            </Link>
            <Link
              href="/vip/protokoly"
              className="rounded-full border border-[#005B96]/40 bg-white px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#eef6fc]"
            >
              VIP protokoly
            </Link>
            <Link
              href="/predplatne"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Předplatné / tringelt
            </Link>
          </div>
        </div>
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
