import { createClient } from "@/lib/supabase/server";
import { seedPublicArticlesIfEmpty } from "@/lib/verejnost/seed-public-articles";

let ensurePromise: Promise<{ seeded: boolean }> | null = null;

export async function countPublicArticles(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("audience", "public")
    .eq("published", true);

  if (error) {
    console.error("countPublicArticles", error);
    return 0;
  }
  return count ?? 0;
}

/** Pokud DB nemá veřejné články, spustí cron writery nebo statický seed (2–3 články). */
export async function ensurePublicArticlesSeeded(): Promise<{ seeded: boolean }> {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    const existing = await countPublicArticles();
    if (existing > 0) return { seeded: false };

    try {
      const { runPublicArticlesFetch } = await import("@/lib/v25/runners/public");
      const result = await runPublicArticlesFetch({ limitPerWriter: 1, skipAds: true });
      const afterCron = await countPublicArticles();
      if (result.ok && afterCron > 0) return { seeded: true };
    } catch (error) {
      console.error("ensurePublicArticlesSeeded:cron", error);
    }

    try {
      const { seeded } = await seedPublicArticlesIfEmpty();
      if (seeded > 0) return { seeded: true };
    } catch (error) {
      console.error("ensurePublicArticlesSeeded:seed", error);
    }

    try {
      const { ensurePublicArticleSeed } = await import("@/lib/verejnost/seed-articles");
      const { seeded, skipped } = await ensurePublicArticleSeed();
      return { seeded: seeded > 0 && !skipped };
    } catch (error) {
      console.error("ensurePublicArticlesSeeded:seed-articles", error);
      return { seeded: false };
    }
  })();

  return ensurePromise;
}
