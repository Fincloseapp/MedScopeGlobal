import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return NextResponse.json({
    ok: true,
    siteUrl,
    vercel: Boolean(process.env.VERCEL),
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null,
    timestamp: new Date().toISOString(),
  });
}
