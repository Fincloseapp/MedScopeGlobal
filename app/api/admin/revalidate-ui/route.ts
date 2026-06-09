import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";
import { V20_UI_BUILD_STAMP, V20_UI_VERSION } from "@/lib/v20/version";

export const runtime = "nodejs";

const PATHS = [
  "/",
  "/articles",
  "/studie",
  "/studie/nejnovejsi",
  "/studie/archiv",
  "/leky",
  "/leky/novinky",
  "/leky/schvalene",
  "/leky/pipeline",
  "/legislativa",
  "/digital-health",
  "/digital-health/novinky",
  "/novinky",
  "/novinky/univerzity",
  "/newsletter",
  "/newsletter/posledni",
  "/medicina",
  "/medicina/hry",
  "/medicina/plany",
  "/odborne/briefy",
  "/odborne",
] as const;

const TAGS = [
  "medscope-ui-v23.0",
  "medscope-ui-v22.4",
  "medscope-ui-v22.3",
  "medscope-pages",
  "v22-content",
  "v20-articles",
] as const;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const revalidated: string[] = [];
  for (const path of PATHS) {
    revalidatePath(path, "page");
    revalidatePath(path, "layout");
    revalidated.push(path);
  }
  for (const tag of TAGS) {
    try {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    } catch {
      /* ok */
    }
  }

  return NextResponse.json({
    status: "ok",
    engineVersion: V19_ENGINE_VERSION,
    uiVersion: V20_UI_VERSION,
    uiBuild: V20_UI_BUILD_STAMP,
    revalidated,
    at: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    status: "ok",
    uiVersion: V20_UI_VERSION,
    uiBuild: V20_UI_BUILD_STAMP,
    paths: PATHS,
    tags: TAGS,
    usage: "POST with Authorization: Bearer CRON_SECRET",
  });
}
