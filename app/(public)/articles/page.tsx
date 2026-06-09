import type { Metadata } from "next";
import Link from "next/link";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getLatestArticles } from "@/lib/queries/articles";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Články — MedScopeGlobal",
    description: "Aktuální odborné články v češtině. Starší a legacy obsah je archivován.",
    path: "/articles",
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ med_track?: string; rok?: string }>;
}) {
  const sp = await searchParams;
  const locale = "cs" as const;
  const { isVip, accessLevel } = await getReaderContext();

  const medTrack = sp.med_track === "priprava" || sp.med_track === "studium" ? sp.med_track : null;
  const year = sp.rok ? Number(sp.rok) : undefined;

  const coreArticles = await getLatestArticles(24, 0, isVip, accessLevel, locale);
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

  const articles = medTrack ? medArticles : coreArticles;

  return (
    <div className="v20-articles mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        Odborný obsah
      </p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#021d33]">Články</h1>
          <p className="mt-2 text-slate-600">
            Pouze aktuální články v češtině. Legacy obsah a staré záznamy jsou skryté.
          </p>
        </div>
        <Link href="/medicina" className="text-sm font-medium text-primary hover:underline">
          Medicínská větev →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full border px-3 py-1.5 text-sm ${!medTrack ? "bg-primary text-white" : "bg-white"}`}
        >
          Vše
        </Link>
        <Link
          href="/articles?med_track=priprava"
          className={`rounded-full border px-3 py-1.5 text-sm ${medTrack === "priprava" ? "bg-primary text-white" : "bg-white"}`}
        >
          Příprava LF
        </Link>
        <Link
          href="/articles?med_track=studium"
          className={`rounded-full border px-3 py-1.5 text-sm ${medTrack === "studium" ? "bg-primary text-white" : "bg-white"}`}
        >
          Studium medicíny
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <V20ArticleCard key={a.id} article={a} />
        ))}
      </div>
      {articles.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Žádné aktivní články. Podívejte se na{" "}
          <Link href="/odborne/briefy" className="text-primary hover:underline">
            odborné briefy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
