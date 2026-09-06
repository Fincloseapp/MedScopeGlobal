import { NextResponse } from "next/server";
import { isCloudflareRuntime } from "@/lib/config/runtime";
import { getSiteUrl } from "@/lib/config/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const cloudflare = isCloudflareRuntime();
  return NextResponse.json({
    ok: true,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || getSiteUrl(),
    runtime: process.env.MEDSCOPE_RUNTIME || (cloudflare ? "cloudflare-workers" : "unknown"),
    cloudflare,
    gitSha: process.env.CF_PAGES_COMMIT_SHA?.trim() || null,
    timestamp: new Date().toISOString(),
  });
}
