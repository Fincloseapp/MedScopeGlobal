import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { V20ArticleCard } from "@/components/v20/article-card";
import { Button } from "@/components/ui/button";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesByCategory } from "@/lib/queries/articles";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getV20CategoryBySlug } from "@/lib/v20/categories";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { SITE } from "@/lib/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 9;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug, "cs");
  const v20 = getV20CategoryBySlug(slug);
  if (!category) return { title: "Obor" };
  const desc = v20?.descriptionCs ?? category.description ?? `Články z oboru ${category.name}.`;
  return buildV20PageMetadata({
    title: `${category.name} — MedScopeGlobal`,
    description: desc,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug, "cs");
  const v20 = getV20CategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const { isVip, accessLevel } = await getReaderContext();

  const { articles, total } = await getArticlesByCategory(
    slug,
    PAGE_SIZE,
    offset,
    isVip,
    accessLevel,
    "cs"
  );

  if (total === 0 && page === 1) notFound();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const desc = v20?.descriptionCs ?? category.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: desc,
    url: `${SITE.url}/category/${category.slug}`,
    inLanguage: "cs-CZ",
    isPartOf: { "@type": "WebSite", name: "MedScopeGlobal", url: SITE.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="v20-category mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          Odborný obor
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">{category.name}</h1>
        {desc && <p className="mt-4 max-w-3xl text-slate-600">{desc}</p>}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <V20ArticleCard key={a.id} article={a} />
          ))}
        </div>

        {articles.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            V tomto oboru zatím nejsou aktivní články.
          </p>
        )}

        <div className="mt-12 flex items-center justify-between gap-4">
          <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={`/category/${slug}?page=${page - 1}`}>Předchozí</Link>
            ) : (
              <span>Předchozí</span>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Strana {page} z {totalPages}
          </p>
          <Button variant="outline" disabled={page >= totalPages} asChild={page < totalPages}>
            {page < totalPages ? (
              <Link href={`/category/${slug}?page=${page + 1}`}>Další</Link>
            ) : (
              <span>Další</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
