import { NextResponse } from "next/server";
import { buildPrepTest } from "@/lib/mediprep/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const test = buildPrepTest({
    mode: url.searchParams.get("mode") ?? undefined,
    subject: url.searchParams.get("subject") ?? undefined,
    faculty: url.searchParams.get("faculty") ?? undefined,
    count: url.searchParams.get("count") ? Number(url.searchParams.get("count")) : undefined,
    seed: url.searchParams.get("seed") ?? undefined,
  });
  return NextResponse.json({ test });
}
