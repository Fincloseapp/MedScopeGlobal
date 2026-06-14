import type { Metadata } from "next";
import Link from "next/link";
import { V20ArticleCard } from "@/components/v20/article-card";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesByMetadataSection } from "@/lib/queries/articles";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

const SECTION_SLUG = "aktuální-zprávy";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Aktuální zprávy — MedScopeGlobal",
    description:
      "Zahraniční a domácí zdravotnické zprávy v redakčním standardu v26 — srozumitelně pro praxi i veřejnost.",
    path: "/aktualni-zpravy",
  });
}

export default async function AktualniZpravyPage() {
  const locale = "cs" as const;
  const { isVip, accessLevel } = await getReaderContext();
  const articles = await getArticlesByMetadataSection(
    SECTION_SLUG,
    48,
    isVip,
    accessLevel,
    locale
  );

  return (
    <ModulePageShell
      eyebrow="Zpravodajství"
      title="Aktuální zprávy"
      description="Vybrané zdravotnické zprávy ze světových zdrojů — přepsané do češtiny podle redakčního standardu MedScopeGlobal v26."
      ctaHref="/articles"
      ctaLabel="Všechny články"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Aktuální zprávy</span>
      </nav>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <V20ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Zatím nejsou publikované zprávy v této rubrice. Prozkoumejte{" "}
          <Link href="/articles" className="text-primary hover:underline">
            všechny články
          </Link>
          .
        </p>
      )}
    </ModulePageShell>
  );
}
