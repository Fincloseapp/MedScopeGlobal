import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return NextResponse.json({
    ok: true,
    siteUrl,
    runtime: process.env.MEDSCOPE_RUNTIME || (process.env.VERCEL ? "vercel" : "unknown"),
    cloudflare: process.env.MEDSCOPE_RUNTIME === "cloudflare-workers" || Boolean(process.env.CF_PAGES),
    vercel: Boolean(process.env.VERCEL),
    gitSha:
      process.env.CF_PAGES_COMMIT_SHA?.trim() ||
      process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
      null,
    timestamp: new Date().toISOString(),
  });
}
