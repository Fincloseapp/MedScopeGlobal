import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function ContentRecommendations({
  locale = "cs",
  currentSlug,
}: {
  locale?: string;
  currentSlug?: string;
}) {
  const isCs = locale === "cs";
  const supabase = await createClient();

  let articles: { slug: string; title: string; excerpt: string | null }[] = [];
  let studies: { slug: string; title: string; abstract: string | null }[] = [];
  let diagnoses: { slug: string; name: string; description: string | null }[] = [];

  if (supabase) {
    const [articlesRes, studiesRes, diagnosesRes] = await Promise.all([
      supabase
        .from("articles")
        .select("slug, title, excerpt")
        .eq("published", true)
        .neq("slug", currentSlug ?? "")
        .order("published_at", { ascending: false })
        .limit(4),
      supabase
        .from("studies")
        .select("slug, title, abstract")
        .eq("published", true)
        .order("published_date", { ascending: false })
        .limit(3),
      supabase
        .from("diagnoses")
        .select("slug, name, description")
        .eq("published", true)
        .limit(3),
    ]);
    articles = articlesRes.data ?? [];
    studies = studiesRes.data ?? [];
    diagnoses = diagnosesRes.data ?? [];
  }

  if (!articles.length) {
    const { getDemoMagazineArticles } = await import(
      "@/lib/verejnost/demo-magazine-articles"
    );
    articles = getDemoMagazineArticles()
      .filter((a) => a.slug !== currentSlug)
      .slice(0, 4)
      .map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt }));
  }

  if (!articles.length && !studies.length && !diagnoses.length) return null;

  return (
    <section
      className="mt-12 space-y-8 rounded-2xl border bg-medical-light/50 p-6 dark:bg-muted/30"
      aria-label={isCs ? "Doporučený obsah" : "Recommended content"}
    >
      <h2 className="font-display text-xl font-semibold text-medical-navy dark:text-foreground">
        {isCs ? "Doporučený obsah" : "Recommended content"}
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {articles.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isCs ? "Články" : "Articles"}
            </h3>
            <ul className="space-y-2 text-sm">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/article/${a.slug}`}
                    className="text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {studies.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isCs ? "Studie" : "Studies"}
            </h3>
            <ul className="space-y-2 text-sm">
              {studies.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/study/${s.slug}`}
                    className="text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagnoses.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isCs ? "Diagnózy" : "Diagnoses"}
            </h3>
            <ul className="space-y-2 text-sm">
              {diagnoses.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/diagnosis/${d.slug}`}
                    className="text-primary hover:underline"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
