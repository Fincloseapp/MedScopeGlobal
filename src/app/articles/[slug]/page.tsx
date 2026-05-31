import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleAccessDisclosure } from "@/components/article-access-disclosure";
import { JsonLd } from "@/components/json-ld";
import { ViewTracker } from "@/components/view-tracker";
import { articleAccessCookieName, publicExcerpt, readArticleAccessCookie, resolveArticleAccess } from "@/lib/article-access";
import { articles, audienceLabels } from "@/lib/data";
import { getArticleBySlug } from "@/lib/content";
import { articleJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Článek nenalezen" };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      emails: [siteConfig.contactEmail]
    }
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const cookieStore = await cookies();
  const profile = readArticleAccessCookie(cookieStore.get(articleAccessCookieName)?.value);
  const access = resolveArticleAccess(article, profile);
  const related = articles
    .filter((item) => item.slug !== article.slug && item.specialization === article.specialization)
    .slice(0, 3);
  const audienceLabel = audienceLabels[article.audience];

  return (
    <main className="section">
      <JsonLd data={articleJsonLd(article)} />
      <ViewTracker
        payload={{
          name: "article_view",
          source: article.source,
          segment: article.specialization,
          value: { slug: article.slug, audience: article.audience, access: access.hasFullAccess ? "full" : "preview" }
        }}
      />
      <article className="card article-detail">
        <div className="meta">
          <span className="tag">{article.specialization}</span>
          <span className="tag">{access.accessLabel}</span>
        </div>
        <h1>{article.title}</h1>
        <p className="lead">{article.summary}</p>
        <div className="meta">
          <span>Autor: {article.author}</span>
          <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(article.date))}</span>
          <span>Úroveň: {audienceLabel}</span>
          <span>
            Zdroj:{" "}
            {article.sourceUrl ? (
              <a href={article.sourceUrl} target="_blank" rel="noreferrer">
                {article.source}
              </a>
            ) : (
              article.source
            )}
          </span>
          <span>{article.readingTime} min čtení</span>
        </div>
        <p>{access.hasFullAccess ? article.content : publicExcerpt(article.content)}</p>
        <ArticleAccessDisclosure
          accessLabel={access.accessLabel}
          audienceLabel={audienceLabel}
          message={access.message}
          hasFullAccess={access.hasFullAccess}
          requiresSubscription={access.requiresSubscription}
        />
      </article>

      {related.length ? (
        <section className="section related-section" aria-labelledby="related-articles">
          <p className="eyebrow">Související články a novinky</p>
          <h2 id="related-articles">Pokračujte v tématu {article.specialization}.</h2>
          <div className="grid">
            {related.map((item) => (
              <article className="card" key={item.id}>
                <span className="tag">{audienceLabels[item.audience]}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="meta">
                  <span>{item.author}</span>
                  <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(item.date))}</span>
                  <span>{item.source}</span>
                </div>
                <Link className="button" href={`/articles/${item.slug}`}>
                  Číst více / Read more
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
