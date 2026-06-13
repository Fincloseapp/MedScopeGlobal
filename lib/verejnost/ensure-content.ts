import { createClient } from "@/lib/supabase/server";
import { seedPublicArticlesIfEmpty } from "@/lib/verejnost/seed-public-articles";

let ensureDateKey: string | null = null;
let ensurePromise: Promise<{ seeded: boolean }> | null = null;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

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

export async function countPublicArticlesToday(): Promise<number> {
  const supabase = await createClient();
  const start = `${todayKey()}T00:00:00.000Z`;
  const end = `${todayKey()}T23:59:59.999Z`;
  const { count, error } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("audience", "public")
    .eq("published", true)
    .gte("published_at", start)
    .lte("published_at", end);

  if (error) {
    console.error("countPublicArticlesToday", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Ensures public articles exist when DB is empty (static seed only).
 * Daily generation is handled exclusively by /api/cron/public-articles at 06:30 UTC.
 */
export async function ensurePublicArticlesSeeded(): Promise<{ seeded: boolean }> {
  const key = todayKey();
  if (ensurePromise && ensureDateKey === key) return ensurePromise;

  ensureDateKey = key;
  ensurePromise = (async () => {
    const existing = await countPublicArticles();
    if (existing > 0) return { seeded: false };

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
