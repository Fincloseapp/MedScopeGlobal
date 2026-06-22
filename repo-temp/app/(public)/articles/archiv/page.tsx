import type { Metadata } from "next";
import Link from "next/link";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getArchivedArticles } from "@/lib/queries/articles";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { V20_ARCHIVE_CUTOFF } from "@/lib/v20/content-rules";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Archiv článků — MedScopeGlobal",
    description: "Starší odborné články a briefy — stále dostupné ke čtení.",
    path: "/articles/archiv",
  });
}

export default async function ArticlesArchivePage() {
  const { articles } = await getArchivedArticles(36);
  const cutoffLabel = new Date(V20_ARCHIVE_CUTOFF).toLocaleDateString("cs-CZ");

  return (
    <div className="v20-articles mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/articles" className="hover:text-foreground">
          Články
        </Link>
        <span className="mx-2">/</span>
        <span>Archiv</span>
      </nav>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        Archiv
      </p>
      <h1 className="font-display text-3xl font-bold text-[#021d33]">Archiv článků</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Starší obsah (před {cutoffLabel}) a expirované briefy zůstávají dostupné. Jednotlivé články
        načtete přímo přes odkaz nebo vyhledávání.
      </p>

      {articles.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <V20ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          V archivu zatím nejsou zobrazené žádné články.
        </p>
      )}
    </div>
  );
}
