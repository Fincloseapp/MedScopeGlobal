import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/article-card";
import { Button } from "@/components/ui/button";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesByCategory } from "@/lib/queries/articles";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { getServerLocale } from "@/lib/i18n/server-locale";

const PAGE_SIZE = 9;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const category = await getCategoryBySlug(slug, locale);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description:
      category.description ??
      `Articles in ${category.name} from MedScopeGlobal.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | MedScopeGlobal`,
      description: category.description ?? undefined,
      url: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();

  const { articles, total } = await getArticlesByCategory(
    slug,
    PAGE_SIZE,
    offset,
    isVip,
    accessLevel,
    locale
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `/category/${category.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "MedScopeGlobal",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Category
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-medical-navy">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {category.description}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>

        {articles.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            No published articles in this category yet.
          </p>
        )}

        <div className="mt-12 flex items-center justify-between gap-4">
          <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={`/category/${slug}?page=${page - 1}`}>
                Previous
              </Link>
            ) : (
              <span>Previous</span>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link href={`/category/${slug}?page=${page + 1}`}>
                Next
              </Link>
            ) : (
              <span>Next</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
