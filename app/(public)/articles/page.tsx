import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MagazineListing } from "@/components/articles/magazine-listing";
import { ViaLongeVitaMasthead } from "@/components/brand/vialongevita-mark";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getLatestArticles } from "@/lib/queries/articles";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { MAGAZINE, getMagazineListingCopy } from "@/lib/brand/magazine";
import { VITASCOPE_TRACK_LOGO } from "@/lib/brand/vitascope";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { isCzechSurface } from "@/lib/i18n/surface-copy";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { assignUniqueListingCovers } from "@/lib/ecosystem/editorial/images/unique-listing-covers";
import { filterArticlesForDesk, mixListableFeed, newsDesksForLocale, type NewsDeskId } from "@/lib/v271/news-desks";

export const revalidate = 120;

const DESK_IDS = new Set<NewsDeskId>(["novinky", "verejnost", "dlouhovekost", "clanky"]);

function parseDesk(value: string | undefined): NewsDeskId | null {
  if (value && DESK_IDS.has(value as NewsDeskId)) return value as NewsDeskId;
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ desk?: string; med_track?: string }>;
}): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMagazineListingCopy(locale);
  const desks = newsDesksForLocale(locale);
  const sp = await searchParams;
  const desk = parseDesk(sp.desk);
  const magazineDesk = desks.find((item) => item.id === "clanky");
  const title =
    sp.med_track === "priprava"
      ? copy.prep
      : sp.med_track === "studium"
        ? copy.study
        : desk
          ? (desks.find((item) => item.id === desk)?.label ?? magazineDesk?.label ?? MAGAZINE.name)
          : (magazineDesk?.label ?? MAGAZINE.name);
  return buildV20PageMetadata({
    title,
    description:
      locale === "cs"
        ? `Aktuální zdravotnické články: novinky, veřejné zdraví, dlouhověkost a redakční magazín ${MAGAZINE.name}.`
        : `Current health articles: news, public health, longevity, and the ${MAGAZINE.name} magazine.`,
    path: desk ? `/articles?desk=${desk}` : "/articles",
    locale,
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ med_track?: string; rok?: string; desk?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getServerLocale();
  const copy = getMagazineListingCopy(locale);
  const { isVip, accessLevel } = await getReaderContext();
  const desk = parseDesk(sp.desk);

  const medTrackRaw = sp.med_track === "priprava" || sp.med_track === "studium" ? sp.med_track : null;
  const medTrack = isCzechSurface(locale) ? medTrackRaw : null;
  const year = sp.rok ? Number(sp.rok) : undefined;

  const coreArticles = await getLatestArticles(48, 0, isVip, accessLevel, locale);
  const medArticles = medTrack
    ? await getMedicalArticles({
        medTrack,
        studyYear: Number.isFinite(year) ? year : undefined,
        limit: 12,
        isVip,
        accessLevel,
        locale,
      })
    : [];

  if (medTrack) {
    const title = medTrack === "priprava" ? copy.prep : copy.study;
    const blurb =
      medTrack === "priprava"
        ? `${copy.prep} — ${MAGAZINE.name}`
        : `${copy.study} — ${MAGAZINE.name}`;

    return (
      <div className="v20-articles mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <ViaLongeVitaMasthead locale={locale} title={title} blurb={blurb} />
        <nav aria-label={copy.studyLabel} className="mt-6 flex flex-wrap gap-2">
          <Link href={localizePublicHref("/articles", locale)} className="rounded-full border bg-white px-3 py-1.5 text-sm">
            {copy.all}
          </Link>
          <Link
            href={localizePublicHref("/articles?med_track=priprava", locale)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              medTrack === "priprava" ? "border-[#005B96] bg-primary text-white" : "bg-white"
            }`}
          >
            <span className="relative h-5 w-5 overflow-hidden rounded-full bg-[#050b1d]">
              <Image src={VITASCOPE_TRACK_LOGO.priprava} alt="" fill className="object-cover" sizes="20px" />
            </span>
            {copy.prep}
          </Link>
          <Link
            href={localizePublicHref("/articles?med_track=studium", locale)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              medTrack === "studium" ? "border-[#005B96] bg-primary text-white" : "bg-white"
            }`}
          >
            <span className="relative h-5 w-5 overflow-hidden rounded-full bg-[#050b1d]">
              <Image src={VITASCOPE_TRACK_LOGO.studium} alt="" fill className="object-cover" sizes="20px" />
            </span>
            {copy.study}
          </Link>
        </nav>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {medArticles.map((article) => (
            <V20ArticleCard key={article.slug} article={article} locale={locale} />
          ))}
        </div>
      </div>
    );
  }

  const mixed = assignUniqueListingCovers(
    mixListableFeed(filterArticlesForDesk(coreArticles, desk, locale), 24, locale)
  );
  return <MagazineListing articles={mixed} activeDesk={desk} locale={locale} />;
}
