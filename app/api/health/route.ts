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
    timestamp: new Date().toISOString(),
  });
}
