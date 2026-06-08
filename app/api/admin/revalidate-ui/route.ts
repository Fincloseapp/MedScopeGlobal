import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";
import { V20_UI_BUILD_STAMP, V20_UI_VERSION } from "@/lib/v20/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PATHS = [
  "/",
  "/articles",
  "/categories",
  "/odborne/briefy",
  "/odborne",
  "/category/revmatologie",
  "/category/kardiologie",
] as const;

const TAGS = [
  "medscope-ui-v20.1",
  "medscope-ui-v20.0",
  "medscope-ui-v19.9",
  "medscope-pages",
  "v19-articles",
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
