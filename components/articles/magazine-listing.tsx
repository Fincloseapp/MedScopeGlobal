import Link from "next/link";
import { NewsMagazineCard } from "@/components/articles/news-article-card";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { MAGAZINE } from "@/lib/brand/magazine";
import { NEWS_DESKS, type NewsDeskId } from "@/lib/v271/news-desks";
import { formatPortal, getPortalUi, showCzechAcademyPrep } from "@/lib/i18n/portal-copy";
import { getMagazineListingUi } from "@/lib/i18n/magazine-listing-copy";

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
  const portal = getPortalUi(locale);
  const listing = getMagazineListingUi(locale);
  const showAcademy = showCzechAcademyPrep(locale);

  const deskCopy: Record<NewsDeskId, { label: string; kicker: string; blurb: string }> = {
    novinky: { label: portal.deskNews, kicker: listing.kickerNews, blurb: listing.blurbNews },
    verejnost: { label: portal.deskPublic, kicker: listing.kickerPublic, blurb: listing.blurbPublic },
    dlouhovekost: {
      label: portal.deskLongevity,
      kicker: listing.kickerLongevity,
      blurb: listing.blurbLongevity,
    },
    clanky: { label: portal.deskArticles, kicker: listing.kickerArticles, blurb: listing.blurbArticles },
  };

  const deskId = (activeDesk ?? "clanky") as NewsDeskId;
  const desk = deskCopy[deskId] ?? deskCopy.clanky;

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
          {listing.archive}
        </Link>
      </div>

      <nav aria-label={listing.desksAria} className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full border px-3 py-1.5 text-sm ${
            !activeDesk ? "bg-[#005B96] text-white border-[#005B96]" : "bg-white text-slate-700"
          }`}
        >
          {listing.allFilter}
        </Link>
        {NEWS_DESKS.map((item) => {
          const copy = deskCopy[item.id];
          return (
            <Link
              key={item.id}
              href={item.id === "clanky" ? "/articles?desk=clanky" : `/articles?desk=${item.id}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                activeDesk === item.id
                  ? "bg-[#005B96] text-white border-[#005B96]"
                  : "bg-white text-slate-700"
              }`}
            >
              {copy.label}
            </Link>
          );
        })}
        {showAcademy ? (
          <>
            <Link
              href="/articles?med_track=priprava"
              className="rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
            >
              {listing.lfPrep}
            </Link>
            <Link
              href="/articles?med_track=studium"
              className="rounded-full border bg-white px-3 py-1.5 text-sm text-slate-700"
            >
              {listing.medStudy}
            </Link>
          </>
        ) : null}
      </nav>

      {featured ? (
        <div className="mt-8">
          <NewsMagazineCard article={featured} featured />
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cfe1f3] bg-[#f6fbff] px-6 py-10 text-center">
          <p className="font-display text-xl font-semibold text-[#021d33]">
            {formatPortal(listing.emptyTitle, { magazine: MAGAZINE.name })}
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            {listing.emptyBody}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/mediflow"
              className="rounded-full bg-[#005B96] px-4 py-2 text-sm font-medium text-white hover:bg-[#004a7a]"
            >
              {portal.openMediFlow}
            </Link>
            <Link
              href="/vip/protokoly"
              className="rounded-full border border-[#005B96]/40 bg-white px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#eef6fc]"
            >
              {portal.vipProtocols}
            </Link>
            <Link
              href="/predplatne"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {portal.subscribe}
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
        {listing.disclaimer}
      </p>
    </div>
  );
}
