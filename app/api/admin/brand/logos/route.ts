import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { MEDSCOPE_LOGO_CANONICAL_NAMES } from "@/lib/brand/logo";
import { LOGO_FILES } from "@/lib/brand/logo-paths.generated";

export const dynamic = "force-dynamic";

const DEST = join(process.cwd(), "public", "assets", "logo");

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    sourceDir: "D:\\MedScopeGlobal\\logo",
    destDir: "public/assets/logo",
    files: MEDSCOPE_LOGO_CANONICAL_NAMES,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const variant = form.get("variant") as string | null;
    const file = form.get("file") as File | null;

    if (!variant || !file) {
      return NextResponse.json({ error: "variant and file required" }, { status: 400 });
    }

    const nameMap: Record<string, string> = {
      transparent: "Logo_Transparent.png",
      print: "Logo_Print.png",
      negative: "Logo_Negative.png",
    };

    const filename = nameMap[variant];
    if (!filename) {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    mkdirSync(DEST, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(DEST, filename), buf);

    const nextFiles = { ...LOGO_FILES, [variant]: filename };
    const generatedPath = join(process.cwd(), "lib", "brand", "logo-paths.generated.ts");
    writeFileSync(
      generatedPath,
      `/** AUTO-GENERATED — admin upload + sync-logos-from-d.mjs */\nexport const LOGO_FILES = ${JSON.stringify(nextFiles, null, 2)} as const;\n`
    );

    const manifestPath = join(DEST, "manifest.json");
    const manifest = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, "utf8"))
      : { sourceDir: "D:\\MedScopeGlobal\\logo", destDir: "public/assets/logo", files: {} };
    manifest.files = { ...manifest.files, [variant]: filename };
    manifest.syncedAt = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return NextResponse.json({ ok: true, filename, variant });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
