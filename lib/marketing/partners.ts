import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type MarketingPartner = {
  id: string;
  name: string;
  category?: string;
  url?: string;
  commission_pct?: number;
  relevance?: number;
  traffic_potential?: number;
  score?: number;
};

export function loadMarketingPartners(): MarketingPartner[] {
  const dataRoot = process.env.MEDSCOPE_DATA_ROOT ?? "D:\\medscope.data";
  const file = join(dataRoot, "ads", "partners.json");
  if (!existsSync(file)) return [];
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as { partners?: MarketingPartner[] };
    return raw.partners ?? [];
  } catch {
    return [];
  }
}
