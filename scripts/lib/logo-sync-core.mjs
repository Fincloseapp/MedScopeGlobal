import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_SOURCE_DIR = process.env.MEDSCOPE_LOGO_SOURCE ?? "D:\\MedScopeGlobal\\logo";

export const CANONICAL = [
  {
    variant: "transparent",
    dest: "Logo_Transparent.png",
    sources: ["Logo_Transparent.png", "Logo1_1781011732671.jpeg", "Logo1_1781011732671.jpg"],
  },
  {
    variant: "print",
    dest: "Logo_Print.png",
    sources: ["Logo_Print.png", "Logo2_1781012016912.jpg", "Logo2_1781012016912.jpeg"],
  },
  {
    variant: "negative",
    dest: "Logo_Negative.png",
    sources: ["Logo_Negative.png", "Logo4_1781012021235.jpg", "Logo4_1781012021235.jpeg"],
  },
];

export function detectExt(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return ".png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return ".jpg";
  return ".png";
}

export function resolveDestFilename(canonicalDest, buf) {
  const ext = detectExt(buf);
  return canonicalDest.replace(/\.(png|jpg|jpeg)$/i, "") + ext;
}

export function writeLogoArtifacts(root, destDir, resolved, sourceDir) {
  writeFileSync(
    join(destDir, "manifest.json"),
    JSON.stringify(
      {
        sourceDir,
        syncedAt: new Date().toISOString(),
        version: "v23.2.0",
        files: {
          transparent: resolved.transparent ?? "Logo_Transparent.png",
          print: resolved.print ?? "Logo_Print.png",
          negative: resolved.negative ?? "Logo_Negative.png",
        },
      },
      null,
      2
    )
  );

  writeFileSync(
    join(root, "lib", "brand", "logo-paths.generated.ts"),
    `/** AUTO-GENERATED — scripts/sync-logos.mjs */\nexport const LOGO_FILES = ${JSON.stringify(
      {
        transparent: resolved.transparent ?? "Logo_Transparent.png",
        print: resolved.print ?? "Logo_Print.png",
        negative: resolved.negative ?? "Logo_Negative.png",
      },
      null,
      2
    )} as const;\n`
  );
}

export function syncLogosFromSource({ root, sourceDir = DEFAULT_SOURCE_DIR }) {
  const destDir = join(root, "public", "assets", "logo");
  mkdirSync(destDir, { recursive: true });

  const resolved = {};
  const log = [];

  for (const { dest, sources, variant } of CANONICAL) {
    let copied = false;
    for (const src of sources) {
      const srcPath = join(sourceDir, src);
      if (!existsSync(srcPath)) continue;
      const buf = readFileSync(srcPath);
      const finalName = resolveDestFilename(dest, buf);
      copyFileSync(srcPath, join(destDir, finalName));
      resolved[variant] = finalName;
      log.push({ src, dest: finalName });
      copied = true;
      break;
    }
    if (!copied) log.push({ missing: dest, sources });
  }

  writeLogoArtifacts(root, destDir, resolved, sourceDir);
  return { resolved, log, destDir };
}
