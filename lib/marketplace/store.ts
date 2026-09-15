import { salesDb, type SalesClient } from "@/lib/sales/store";
import type { MarketplaceListing, MarketplaceMessage, MarketplaceStatus } from "@/lib/marketplace/types";

function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export function marketplaceDb(timeoutMs: number | null = 8_000): SalesClient | null {
  return salesDb(timeoutMs);
}

export async function insertMarketplaceListing(
  db: SalesClient,
  row: Partial<MarketplaceListing> & {
    kind: MarketplaceListing["kind"];
    company: string;
    title: string;
    summary: string;
  }
): Promise<MarketplaceListing | null> {
  const { data, error } = await db.from("marketplace_listings").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[marketplace] insert listing", error.message);
    return null;
  }
  return data as MarketplaceListing;
}

export async function updateMarketplaceListing(
  db: SalesClient,
  id: string,
  patch: Partial<MarketplaceListing>
): Promise<void> {
  await db.from("marketplace_listings").update(patch).eq("id", id);
}

export async function listMarketplaceListings(
  db: SalesClient,
  limit = 120
): Promise<MarketplaceListing[]> {
  const { data } = await db
    .from("marketplace_listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return asArray<MarketplaceListing>(data);
}

export async function listVisibleMarketplaceListings(
  db: SalesClient,
  kind: "offer" | "demand",
  limit = 200
): Promise<MarketplaceListing[]> {
  const { data } = await db
    .from("marketplace_listings")
    .select("*")
    .eq("kind", kind)
    .eq("status", "visible" satisfies MarketplaceStatus)
    .order("created_at", { ascending: false })
    .limit(limit);
  return asArray<MarketplaceListing>(data);
}

export async function insertMarketplaceMessage(
  db: SalesClient,
  row: Partial<MarketplaceMessage> & { direction: "inbound" | "outbound" }
): Promise<MarketplaceMessage | null> {
  const { data, error } = await db.from("marketplace_messages").insert(row).select("*").maybeSingle();
  if (error) {
    console.warn("[marketplace] insert message", error.message);
    return null;
  }
  return data as MarketplaceMessage;
}

export async function listMarketplaceMessages(db: SalesClient, limit = 80): Promise<MarketplaceMessage[]> {
  const { data } = await db
    .from("marketplace_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return asArray<MarketplaceMessage>(data);
}

export async function findListingByEmail(db: SalesClient, email: string): Promise<MarketplaceListing | null> {
  const { data } = await db
    .from("marketplace_listings")
    .select("*")
    .ilike("contact_email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  return asArray<MarketplaceListing>(data)[0] ?? null;
}
