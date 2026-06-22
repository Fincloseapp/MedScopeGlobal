import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";

export default async function MedPripravaPage() {
  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();
  const articles = await getMedicalArticles({
    medTrack: "priprava",
    limit: 12,
    isVip,
    accessLevel,
    locale,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Domů</Link>
        <span className="mx-2">/</span>
        <span>Příprava na medicínu</span>
      </nav>

      <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">Příprava LF</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-medical-navy">Příprava na medicínu</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Studijní přehledy, opakování základů, témata na přijímačky a denní redakční minimum pro budoucí mediky.
        </p>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>

      <section className="mt-10 rounded-2xl border bg-white p-6">
        <h2 className="font-display text-2xl font-semibold text-medical-navy">Časté otázky</h2>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Co najdu v této větvi?</strong> Přehledy k přijímačkám, biochemii, fyziologii, psychologii a rozcestník pro systémové opakování.</p>
          <p><strong className="text-foreground">Je tento obsah oficiální?</strong> Ano, jde o redakční studijní přehledy, ne o oficiální učebnici LF.</p>
        </div>
      </section>
    </div>
  );
}
