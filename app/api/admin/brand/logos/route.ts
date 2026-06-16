import { NextResponse } from "next/server";

import { writeFileSync, mkdirSync } from "node:fs";

import { join } from "node:path";

import { pathToFileURL } from "node:url";

import { spawnSync } from "node:child_process";

import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import { MEDSCOPE_PROJECT_ROOT, projectPath } from "@/lib/config/paths";

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



const DEST = projectPath("public", "assets", "logo");

const ROOT = MEDSCOPE_PROJECT_ROOT;



function detectExt(buf: Buffer): string {

  if (buf[0] === 0x89 && buf[1] === 0x50) return ".png";

  if (buf[0] === 0xff && buf[1] === 0xd8) return ".jpg";

  return ".png";

}



function runSync() {

  const script = join(ROOT, "scripts", "sync-logos.mjs");

  return spawnSync(process.execPath, [script], { cwd: ROOT, encoding: "utf8" });

}



async function runUploadDerivatives(variant: string, filename: string) {

  const modPath = pathToFileURL(join(ROOT, "scripts", "lib", "logo-sync-core.mjs")).href;
  const { processUploadedLogo } = await import(modPath);

  return processUploadedLogo({ root: ROOT, variant, filename });

}



export async function GET(request: Request) {

  if (!(await isAdminApiAuthorized(request))) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }

  return NextResponse.json({

    ok: true,

    version: "v23.2.3",

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

      const result = runSync();

      if (result.status !== 0) {

        return NextResponse.json(

          { ok: false, error: result.stderr || result.stdout || "Sync failed" },

          { status: 500 }

        );

      }

      return NextResponse.json({

        ok: true,

        action: "sync",

        message: "Logo synchronizována z D:\\MedScopeGlobal\\logo (+ WebP/@2x)",

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

    await runUploadDerivatives(variant, filename);



    return NextResponse.json({ ok: true, filename, variant, path: `/assets/logo/${filename}` });

  } catch (e) {

    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });

  }

}

