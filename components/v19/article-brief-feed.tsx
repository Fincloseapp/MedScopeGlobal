import { V19ArticleBriefCard } from "@/components/v19/article-brief-card";
import { getV19Articles } from "@/lib/v19/engine";
import { resolveV19LocaleFromRequest } from "@/lib/v19/localize";

export async function V19ArticleBriefFeed({
  locale,
  limit = 8,
  title = "Odborné medicínské briefy",
}: {
  locale?: string;
  limit?: number;
  title?: string;
}) {
  const resolved = locale ?? (await resolveV19LocaleFromRequest());
  const articles = await getV19Articles(resolved, limit);

  if (!articles.length) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h2 className="mb-4 font-display text-2xl font-semibold text-medical-navy">{title}</h2>
      <div className="flex flex-col gap-4 overflow-x-hidden">
        {articles.map((article) => (
          <V19ArticleBriefCard key={article.id ?? article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
