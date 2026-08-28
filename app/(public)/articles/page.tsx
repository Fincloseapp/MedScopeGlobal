import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MagazineListing } from "@/components/articles/magazine-listing";
import { VitascopeMastheadBanner } from "@/components/articles/vitascope-mark";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getLatestArticles } from "@/lib/queries/articles";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { VITASCOPE_TRACK_LOGO } from "@/lib/brand/vitascope";
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
  const sp = await searchParams;
  const desk = parseDesk(sp.desk);
  const title =
    sp.med_track === "priprava"
      ? "Příprava LF"
      : sp.med_track === "studium"
        ? "Studium medicíny"
        : desk === "novinky"
          ? "Novinky"
          : desk === "verejnost"
            ? "Články pro veřejnost"
            : desk === "dlouhovekost"
              ? "Dlouhověkost"
              : "Články";
  return buildV20PageMetadata({
    title: `${title} — VITASCOPE`,
    description:
      "Aktuální zdravotnické články v češtině: novinky, veřejné zdraví, dlouhověkost a redakční magazín VITASCOPE.",
    path: desk ? `/articles?desk=${desk}` : "/articles",
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ med_track?: string; rok?: string; desk?: string }>;
}) {
  const sp = await searchParams;
  const locale = "cs" as const;
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
    const title = medTrack === "priprava" ? "Příprava LF" : "Studium medicíny";
    const blurb =
      medTrack === "priprava"
        ? "Přijímačky a základy — VITASCOPE výběr pro přípravu na LF."
        : "Klinický kontext pro studenty medicíny — redakční výběr VITASCOPE.";

    return (
      <div className="v20-articles mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <VitascopeMastheadBanner track={medTrack} title={title} blurb={blurb} />
        <nav aria-label="Odborné stopy" className="mt-6 flex flex-wrap gap-2">
          <Link href="/articles" className="rounded-full border bg-white px-3 py-1.5 text-sm">
            Vše
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
            Příprava LF
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
            Studium medicíny
          </Link>
        </nav>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {medArticles.map((article) => (
            <V20ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    );
  }

  const mixed = mixListableFeed(filterArticlesForDesk(coreArticles, desk), 24);
  return <MagazineListing articles={mixed} activeDesk={desk} />;
}
