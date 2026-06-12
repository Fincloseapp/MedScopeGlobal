import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runPublicArticlesFetch } from "@/lib/v25/runners/public";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const limitPerWriter = Number(url.searchParams.get("limit") ?? 1);

  const result = await runPublicArticlesFetch({ limitPerWriter });
  return NextResponse.json(result);
}
