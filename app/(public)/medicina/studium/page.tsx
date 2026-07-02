import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { OBOR_KEYWORDS } from "@/lib/v22/games";

const OBOR_LABELS: Record<string, string> = {
  anatomie: "Anatomie",
  fyziologie: "Fyziologie",
  patologie: "Patologie",
  klinika: "Klinické obory",
  zkousky: "Zkoušky",
};

function matchesObor(title: string, excerpt: string | null | undefined, obor: string): boolean {
  const kws = OBOR_KEYWORDS[obor] ?? [];
  const text = `${title} ${excerpt ?? ""}`.toLowerCase();
  return kws.some((k) => text.includes(k));
}

export default async function MedStudiumPage({
  searchParams,
}: {
  searchParams: Promise<{ rok?: string; obor?: string }>;
}) {
  const resolved = await searchParams;
  const year = resolved.rok ? Number(resolved.rok) : undefined;
  const obor = resolved.obor;
  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();
  let articles = await getMedicalArticles({
    medTrack: "studium",
    studyYear: Number.isFinite(year) ? year : undefined,
    limit: 24,
    isVip,
    accessLevel,
    locale,
  });

  if (obor && OBOR_KEYWORDS[obor]) {
    articles = articles.filter((a) => matchesObor(a.title, a.excerpt, obor));
  }

  const years = [1, 2, 3, 4, 5, 6];
  const obory = Object.keys(OBOR_LABELS);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Domů</Link>
        <span className="mx-2">/</span>
        <Link href="/medicina" className="hover:text-foreground">Studium medicíny</Link>
        <span className="mx-2">/</span>
        <span>1.–6. ročník</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">1.–6. ročník</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Studium medicíny</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Předměty, kazuistiky, klinický rozbor a tipy do státnic. Filtrujte podle ročníku a oboru.
        </p>
        <Link href="/medicina/hry" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Kvízy a studijní hry →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/medicina/studium"
          className={`rounded-full border px-3 py-1.5 text-sm ${!year && !obor ? "bg-primary text-primary-foreground" : "bg-white"}`}
        >
          Vše
        </Link>
        {years.map((rok) => (
          <Link
            key={rok}
            href={`/medicina/studium?rok=${rok}${obor ? `&obor=${obor}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${year === rok ? "bg-primary text-primary-foreground" : "bg-white"}`}
          >
            {rok}. ročník
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {obory.map((o) => (
          <Link
            key={o}
            href={`/medicina/studium?obor=${o}${year ? `&rok=${year}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${obor === o ? "bg-primary/10 font-medium text-primary" : "bg-white text-slate-700"}`}
          >
            {OBOR_LABELS[o]}
          </Link>
        ))}
      </div>

      {obor && articles.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Pro obor „{OBOR_LABELS[obor]}“ zatím nemáme články — vyzkoušejte kvíz.</p>
          <Link href={`/medicina/hry`} className="mt-4 inline-block text-sm font-medium text-primary">
            Studijní hry →
          </Link>
        </div>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </div>
  );
}
