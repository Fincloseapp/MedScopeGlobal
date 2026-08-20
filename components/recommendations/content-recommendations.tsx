import Link from "next/link";
import { getPublishedReadClient } from "@/lib/supabase/published-read";
import { isPhysicianRestrictedArticle } from "@/lib/articles/professional-access";
import { hasEditorialSetupLeak, sanitizePublicText } from "@/lib/articles/sanitize-display";
import { getOdbornaAccess } from "@/lib/auth/odborna-access";
import { filterCzechContent } from "@/lib/v20/content-rules";

export async function ContentRecommendations({
  locale = "cs",
  currentSlug,
}: {
  locale?: string;
  currentSlug?: string;
}) {
  const isCs = locale === "cs";
  const odborna = await getOdbornaAccess();
  const supabase = await getPublishedReadClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("articles")
    .select("slug, title, excerpt, locale, audience, public_topic, rubric_slug, min_access_level, metadata")
    .eq("published", true)
    .neq("slug", currentSlug ?? "")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(24);

  const rows = (data ?? []).filter((row) => {
    const blob = `${row.title ?? ""} ${row.excerpt ?? ""}`;
    if (hasEditorialSetupLeak(row.title) || hasEditorialSetupLeak(row.excerpt)) return false;
    if (/MeDiprep|MeDipacient|GROQ_API_KEY|plné redakční zpracování/i.test(blob)) return false;
    if (!odborna.allowed && isPhysicianRestrictedArticle(row)) return false;
    return true;
  });
  const localized = filterCzechContent(rows, locale).slice(0, 6);
  if (!localized.length) return null;

  return (
    <section
      className="mt-12 space-y-4 rounded-2xl border bg-medical-light/50 p-6 dark:bg-muted/30"
      aria-label={isCs ? "Doporučený obsah" : "Recommended content"}
    >
      <h2 className="font-display text-xl font-semibold text-medical-navy dark:text-foreground">
        {isCs ? "Doporučený obsah" : "Recommended content"}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {localized.map((a) => (
          <li key={a.slug}>
            <Link href={`/article/${a.slug}`} className="text-primary hover:underline">
              {a.title}
            </Link>
            {a.excerpt ? (
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {sanitizePublicText(a.excerpt)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
