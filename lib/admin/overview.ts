import { AFFILIATE_PRODUCTS } from "@/lib/ecosystem/monetization";
import {
  aggregateAffiliateClicks,
  type AffiliateClickRow,
} from "@/lib/admin/click-stats";
import {
  classifyCategoryRow,
  missingEditorialSlugs,
  taxonomySeedBySlug,
  type CategoryHealthKind,
} from "@/lib/admin/taxonomy";
import { getHeurekaPositionId } from "@/lib/monetization/heureka-affiliate";
import { getPayoutReadiness, type PayoutReadiness } from "@/lib/monetization/payout-map";
import { createAdminReadClient } from "@/lib/auth/require-admin-access";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import type { Category } from "@/types/database";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  published: number;
  drafts: number;
  health: CategoryHealthKind;
  deskAlias?: string;
};

export type AdminOverview = {
  loadedAt: string;
  dataSource: "service-role" | "user-session" | "unavailable";
  articles: { total: number; published: number; drafts: number };
  categories: { total: number; emptyDesks: number; missingEditorial: string[] };
  ads: { total: number; active: number };
  vipActive: number;
  newsletterSubscribers: number;
  stripeSubscriptions: number;
  v27PaidCzk: number;
  v27PaidOrders: number;
  clicks: ReturnType<typeof aggregateAffiliateClicks>;
  readiness: PayoutReadiness;
  heurekaCzId: string | null;
  heurekaSkId: string | null;
  categoryRows: AdminCategoryRow[];
};

type CountResult = { count: number | null; error: { message: string } | null };

async function countSafe(query: PromiseLike<CountResult>): Promise<number> {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export function affiliateProductLabel(slug: string): string {
  const product = AFFILIATE_PRODUCTS.find((item) => item.id === slug);
  return product?.name.cs ?? slug;
}

export async function loadAdminCategoriesForForm(): Promise<Category[]> {
  const client = await createAdminReadClient();
  if (!client) return [];
  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, description, created_at")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data as Category[];
}

export async function loadAdminCategoryRows(): Promise<AdminCategoryRow[]> {
  const client = await createAdminReadClient();
  if (!client) return [];
  const { data: categories, error } = await client
    .from("categories")
    .select("id, name, slug, description")
    .order("name", { ascending: true });
  if (error || !categories) return [];

  const ids = categories.map((row) => row.id as string);
  const counts = new Map<string, { published: number; drafts: number }>();
  for (const id of ids) counts.set(id, { published: 0, drafts: 0 });

  if (ids.length > 0) {
    const { data: articles } = await client
      .from("articles")
      .select("category_id, published")
      .in("category_id", ids);
    for (const article of articles ?? []) {
      const bucket = counts.get(article.category_id as string);
      if (!bucket) continue;
      if (article.published) bucket.published += 1;
      else bucket.drafts += 1;
    }
  }

  return categories.map((row) => {
    const bucket = counts.get(row.id as string) ?? { published: 0, drafts: 0 };
    const slug = String(row.slug);
    const seed = taxonomySeedBySlug(slug);
    return {
      id: String(row.id),
      name: String(row.name),
      slug,
      description: (row.description as string | null) ?? seed?.description ?? null,
      published: bucket.published,
      drafts: bucket.drafts,
      health: classifyCategoryRow({
        slug,
        published: bucket.published,
        drafts: bucket.drafts,
      }),
    };
  });
}

function emptyOverview(): AdminOverview {
  return {
    loadedAt: new Date().toISOString(),
    dataSource: "unavailable",
    articles: { total: 0, published: 0, drafts: 0 },
    categories: {
      total: 0,
      emptyDesks: 0,
      missingEditorial: missingEditorialSlugs([]),
    },
    ads: { total: 0, active: 0 },
    vipActive: 0,
    newsletterSubscribers: 0,
    stripeSubscriptions: 0,
    v27PaidCzk: 0,
    v27PaidOrders: 0,
    clicks: aggregateAffiliateClicks([]),
    readiness: getPayoutReadiness(),
    heurekaCzId: null,
    heurekaSkId: null,
    categoryRows: [],
  };
}

export async function loadAdminOverview(): Promise<AdminOverview> {
  const client = await createAdminReadClient();
  if (!client) return emptyOverview();
  const dataSource = tryCreateServiceRoleClient() ? "service-role" : "user-session";

  const [
    articlesTotal,
    articlesPublished,
    adsTotal,
    adsActive,
    vipActive,
    newsletterSubscribers,
    stripeSubscriptions,
    categoryRows,
    heurekaCzId,
    heurekaSkId,
  ] = await Promise.all([
    countSafe(client.from("articles").select("id", { count: "exact", head: true })),
    countSafe(
      client.from("articles").select("id", { count: "exact", head: true }).eq("published", true)
    ),
    countSafe(client.from("ads").select("id", { count: "exact", head: true })),
    countSafe(client.from("ads").select("id", { count: "exact", head: true }).eq("active", true)),
    countSafe(
      client.from("vip_subscriptions").select("id", { count: "exact", head: true }).eq("active", true)
    ),
    countSafe(client.from("newsletter_subscribers").select("id", { count: "exact", head: true })),
    countSafe(
      client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active")
    ),
    loadAdminCategoryRows(),
    getHeurekaPositionId("cz"),
    getHeurekaPositionId("sk"),
  ]);

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  let clickRows: AffiliateClickRow[] = [];
  try {
    const { data } = await client
      .from("analytics")
      .select("payload, created_at")
      .eq("event", "affiliate_click")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    clickRows = ((data ?? []) as { payload?: { slug?: string; locale?: string; destination?: string }; created_at: string }[])
      .map((row) => ({
        slug: row.payload?.slug ?? null,
        locale: row.payload?.locale ?? null,
        destination: row.payload?.destination ?? null,
        createdAt: row.created_at,
      }));
  } catch {
    clickRows = [];
  }

  let v27PaidCzk = 0;
  let v27PaidOrders = 0;
  try {
    const { data } = await client
      .from("v27_orders")
      .select("amount_czk, status")
      .in("status", ["paid", "completed"])
      .limit(500);
    for (const order of data ?? []) {
      v27PaidCzk += Number(order.amount_czk ?? 0);
      v27PaidOrders += 1;
    }
  } catch {
    v27PaidCzk = 0;
  }

  const emptyDesks = categoryRows.filter(
    (row) => row.health === "editorial-empty" || row.health === "drafts-only"
  ).length;

  return {
    loadedAt: new Date().toISOString(),
    dataSource: dataSource as AdminOverview["dataSource"],
    articles: {
      total: articlesTotal,
      published: articlesPublished,
      drafts: Math.max(0, articlesTotal - articlesPublished),
    },
    categories: {
      total: categoryRows.length,
      emptyDesks,
      missingEditorial: missingEditorialSlugs(categoryRows.map((row) => row.slug)),
    },
    ads: { total: adsTotal, active: adsActive },
    vipActive,
    newsletterSubscribers,
    stripeSubscriptions,
    v27PaidCzk,
    v27PaidOrders,
    clicks: aggregateAffiliateClicks(clickRows),
    readiness: getPayoutReadiness(),
    heurekaCzId,
    heurekaSkId,
    categoryRows,
  };
}
