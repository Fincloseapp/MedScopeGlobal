import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";

export default async function MedStudiumPage({
  searchParams,
}: {
  searchParams: Promise<{ rok?: string }>;
}) {
  const resolved = await searchParams;
  const year = resolved.rok ? Number(resolved.rok) : undefined;
  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();
  const articles = await getMedicalArticles({
    medTrack: "studium",
    studyYear: Number.isFinite(year) ? year : undefined,
    limit: 12,
    isVip,
    accessLevel,
    locale,
  });

  const years = [1, 2, 3, 4, 5, 6];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Domů</Link>
        <span className="mx-2">/</span>
        <span>Studium medicíny</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">1.–6. ročník</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-medical-navy">Studium medicíny</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Větev pro předměty, kazuistiky, klinický rozbor a tipy do státnic. Filtrujte podle ročníku.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/medicina/studium" className={`rounded-full border px-3 py-1.5 text-sm ${!year ? "bg-[#005B96] text-white" : "bg-white text-foreground"}`}>Vše</Link>
        {years.map((rok) => (
          <Link
            key={rok}
            href={`/medicina/studium?rok=${rok}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${year === rok ? "bg-[#005B96] text-white" : "bg-white text-foreground"}`}
          >
            {rok}. ročník
          </Link>
        ))}
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </div>
  );
}
