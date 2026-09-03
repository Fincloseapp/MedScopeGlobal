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
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { filterArticlesForDesk, mixListableFeed, type NewsDeskId } from "@/lib/v271/news-desks";

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
  const sp = await searchParams;
  const desk = parseDesk(sp.desk);
  const title =
    sp.med_track === "priprava"
      ? copy.prep
      : sp.med_track === "studium"
        ? copy.study
        : desk === "novinky"
          ? "Novinky"
          : desk === "verejnost"
            ? "Články pro veřejnost"
            : desk === "dlouhovekost"
              ? "Dlouhověkost"
              : "Články";
  return buildV20PageMetadata({
    title: `${title} — ${MAGAZINE.name}`,
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

  const medTrack = sp.med_track === "priprava" || sp.med_track === "studium" ? sp.med_track : null;
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
          <Link href="/articles" className="rounded-full border bg-white px-3 py-1.5 text-sm">
            {copy.all}
          </Link>
          <Link
            href="/articles?med_track=priprava"
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
            href="/articles?med_track=studium"
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

  const mixed = mixListableFeed(filterArticlesForDesk(coreArticles, desk), 24);
  return <MagazineListing articles={mixed} activeDesk={desk} locale={locale} />;
}
