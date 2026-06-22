import { NextResponse } from "next/server";
import { cacheKey, getCached, setCached } from "@/lib/v20/server-cache";
import { getV20LatestStudies, getV20StudiesList } from "@/lib/v20/studies/query";
import { V20_UI_VERSION } from "@/lib/v20/version";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(24, Number(url.searchParams.get("limit") ?? 8));
  const latest = url.searchParams.get("latest") === "1";

  const ck = cacheKey({ route: "v20-studies", limit, latest: latest ? 1 : 0 });
  const cached = getCached<{ body: object }>(`v20-studies:${ck}`, 120_000);
  if (cached) {
    const res = NextResponse.json(cached.body);
    res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
    res.headers.set("X-Cache", "HIT");
    return res;
  }

  const studies = latest ? await getV20LatestStudies(limit) : await getV20StudiesList(limit);
  const body = {
    status: "ok",
    uiVersion: V20_UI_VERSION,
    locale: "cs",
    count: studies.length,
    studies,
  };
  setCached(`v20-studies:${ck}`, { body });

  const res = NextResponse.json(body);
  res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  res.headers.set("X-Cache", "MISS");
  return res;
}
