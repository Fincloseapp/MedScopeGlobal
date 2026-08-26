import type { Metadata } from "next";
import { MagazineListing } from "@/components/articles/magazine-listing";
import { V20ArticleCard } from "@/components/v20/article-card";
import { MAGAZINE } from "@/lib/brand/magazine";
import { getLatestArticles } from "@/lib/queries/articles";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { filterArticlesForDesk, mixListableFeed, type NewsDeskId } from "@/lib/v271/news-desks";
import Link from "next/link";

export const revalidate = 120;

const DESK_IDS = new Set<NewsDeskId>(["novinky", "verejnost", "dlouhovekost", "clanky"]);

function parseDesk(value: string | undefined): NewsDeskId | null {
  if (value && DESK_IDS.has(value as NewsDeskId)) return value as NewsDeskId;
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ desk?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const desk = parseDesk(sp.desk);
  const title =
    desk === "novinky"
      ? "Novinky"
      : desk === "verejnost"
        ? "Články pro veřejnost"
        : desk === "dlouhovekost"
          ? "Dlouhověkost"
          : "Články";
  return buildV20PageMetadata({
    title: `${title} — ${MAGAZINE.name}`,
    description:
      "Aktuální zdravotnické články v češtině: novinky, veřejné zdraví, dlouhověkost a redakční magazín VitaScope s fotografiemi.",
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
    return (
      <div className="v20-articles mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          Odborný obsah
        </p>
        <h1 className="font-display text-4xl font-bold text-[#021d33]">Články</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/articles" className="rounded-full border bg-white px-3 py-1.5 text-sm">
            Vše
          </Link>
          <Link
            href="/articles?med_track=priprava"
            className={`rounded-full border px-3 py-1.5 text-sm ${
              medTrack === "priprava" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            Příprava LF
          </Link>
          <Link
            href="/articles?med_track=studium"
            className={`rounded-full border px-3 py-1.5 text-sm ${
              medTrack === "studium" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            Studium medicíny
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {medArticles.map((article) => (
            <V20ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        {medArticles.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            Žádné odborné články v této kategorii. Zkuste{" "}
            <Link href="/articles" className="text-primary hover:underline">
              magazín {MAGAZINE.name}
            </Link>{" "}
            nebo{" "}
            <Link href="/app/mediflow" className="text-primary hover:underline">
              MediFlow
            </Link>
            .
          </p>
        ) : null}
      </div>
    );
  }

  const mixed = mixListableFeed(filterArticlesForDesk(coreArticles, desk), 24);
  return <MagazineListing articles={mixed} activeDesk={desk} />;
}
