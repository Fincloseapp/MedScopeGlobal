import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";
import { V20_UI_BUILD_STAMP, V20_UI_VERSION } from "@/lib/v20/version";

export const runtime = "nodejs";

const PATHS = [
  "/",
  "/articles",
  "/aktualni-zpravy",
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
  "/studenti",
  "/studenti/klub",
  "/studenti/zebricek",
  "/studenti/testy",
  "/studenti/hry",
  "/studenti/materialy",
  "/studenti/ai-tutor",
  "/studenti/leky",
  "/studenti/zkousky",
  "/studenti/chci-studovat",
  "/studenti/darkove",
] as const;

const TAGS = [
  "medscope-ui-v23.33",
  "medscope-ui-v23.32",
  "medscope-ui-v23.31",
  "medscope-ui-v23.30",
  "medscope-ui-v23.23",
  "medscope-ui-v23.22",
  "medscope-ui-v23.21",
  "medscope-ui-v23.20",
  "medscope-ui-v23.19",
  "medscope-ui-v23.18",
  "medscope-ui-v23.17",
  "medscope-ui-v23.16",
  "medscope-ui-v23.15",
  "medscope-ui-v23.14",
  "medscope-ui-v23.13",
  "medscope-ui-v23.12",
  "medscope-ui-v23.11",
  "medscope-ui-v23.10",
  "medscope-ui-v23.9",
  "medscope-ui-v23.8",
  "medscope-ui-v23.7",
  "medscope-ui-v23.6",
  "medscope-ui-v23.5",
  "medscope-ui-v23.4",
  "medscope-ui-v23.3",
  "medscope-ui-v23.2",
  "medscope-ui-v23.1",
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
