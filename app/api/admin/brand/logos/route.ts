import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import {
  LOGO_DEST_DIR,
  LOGO_MAPPING,
  LOGO_SOURCE_DIR,
  LOGO_SYNC_COMMAND,
  type LogoVariant,
} from "@/lib/brand/brand-system";
import { MEDSCOPE_LOGO, MEDSCOPE_LOGO_CANONICAL_NAMES } from "@/lib/brand/logo";
import { LOGO_FILES } from "@/lib/brand/logo-paths.generated";

export const dynamic = "force-dynamic";

const DEST = join(process.cwd(), "public", "assets", "logo");

function detectExt(buf: Buffer): string {
  if (buf[0] === 0x89 && buf[1] === 0x50) return ".png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return ".jpg";
  return ".png";
}

function writeGeneratedPaths(files: Record<string, string>) {
  writeFileSync(
    join(process.cwd(), "lib", "brand", "logo-paths.generated.ts"),
    `/** AUTO-GENERATED — admin upload + sync-logos.mjs */\nexport const LOGO_FILES = ${JSON.stringify(files, null, 2)} as const;\n`
  );
}

function updateManifest(variant: string, filename: string) {
  const manifestPath = join(DEST, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : { sourceDir: LOGO_SOURCE_DIR, destDir: LOGO_DEST_DIR, files: {} };
  manifest.files = { ...manifest.files, [variant]: filename };
  manifest.syncedAt = new Date().toISOString();
  manifest.version = "v23.2.0";
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

export async function GET(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    version: "v23.2.0",
    sourceDir: LOGO_SOURCE_DIR,
    destDir: LOGO_DEST_DIR,
    syncCommand: LOGO_SYNC_COMMAND,
    mapping: LOGO_MAPPING,
    canonicalNames: MEDSCOPE_LOGO_CANONICAL_NAMES,
    activePaths: MEDSCOPE_LOGO,
    files: LOGO_FILES,
  });
}

export async function POST(request: Request) {
  if (!(await isAdminApiAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const action = form.get("action") as string | null;

    if (action === "sync") {
      const script = join(process.cwd(), "scripts", "sync-logos.mjs");
      const result = spawnSync(process.execPath, [script], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      if (result.status !== 0) {
        return NextResponse.json(
          { ok: false, error: result.stderr || "Sync failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        action: "sync",
        message: "Logo synchronizována z D:\\MedScopeGlobal\\logo",
        stdout: result.stdout?.trim(),
      });
    }

    const variant = form.get("variant") as LogoVariant | null;
    const file = form.get("file") as File | null;

    if (!variant || !file) {
      return NextResponse.json({ error: "variant and file required" }, { status: 400 });
    }

    const entry = LOGO_MAPPING.find((m) => m.variant === variant);
    if (!entry) {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    mkdirSync(DEST, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = detectExt(buf);
    const baseName = entry.source.replace(/\.(png|jpg|jpeg)$/i, "");
    const filename = baseName + ext;

    writeFileSync(join(DEST, filename), buf);

    const nextFiles = { ...LOGO_FILES, [variant]: filename };
    writeGeneratedPaths(nextFiles);
    updateManifest(variant, filename);

    return NextResponse.json({ ok: true, filename, variant, path: `/assets/logo/${filename}` });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
