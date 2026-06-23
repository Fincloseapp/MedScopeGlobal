import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, parse as pathParse } from "node:path";
import { MEDSCOPE_LOGO_SOURCE, projectPath } from "../../lib/config/paths.mjs";

export const DEFAULT_SOURCE_DIR = MEDSCOPE_LOGO_SOURCE;
const MAX_WEBP_BYTES = 500 * 1024;

export const CANONICAL = [
  {
    variant: "transparent",
    dest: "Logo_Transparent.png",
    sources: ["Logo_Transparent.png", "Logo1_1781011732671.jpeg", "Logo1_1781011732671.jpg"],
    requireAlpha: true,
  },
  {
    variant: "print",
    dest: "Logo_Print.png",
    sources: ["Logo_Print.png", "Logo2_1781012016912.jpg", "Logo2_1781012016912.jpeg"],
    requireAlpha: false,
  },
  {
    variant: "negative",
    dest: "Logo_Negative.png",
    sources: ["Logo_Negative.png", "Logo4_1781012021235.jpg", "Logo4_1781012021235.jpeg"],
    requireAlpha: false,
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

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    return null;
  }
}

async function writeWebp(sharp, inputPath, outputPath, quality = 85) {
  let q = quality;
  for (let attempt = 0; attempt < 4; attempt++) {
    await sharp(inputPath).webp({ quality: q, effort: 4 }).toFile(outputPath);
    const size = statSync(outputPath).size;
    if (size <= MAX_WEBP_BYTES) return { path: outputPath, size, quality: q };
    q -= 12;
  }
  return { path: outputPath, size: statSync(outputPath).size, quality: q };
}

async function generateDerivatives(sharp, basePath, baseName) {
  const meta = await sharp(basePath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  const webpName = `${baseName}.webp`;
  const webpPath = join(pathParse(basePath).dir, webpName);
  const webpResult = await writeWebp(sharp, basePath, webpPath);

  const retinaW = Math.min((w || 512) * 2, 2048);
  const retinaH = Math.round(((h || 512) * retinaW) / Math.max(w || 1, 1));

  const retinaPngName = `${baseName}@2x.png`;
  const retinaPngPath = join(pathParse(basePath).dir, retinaPngName);
  await sharp(basePath)
    .resize(retinaW, retinaH, { fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(retinaPngPath);

  const retinaWebpName = `${baseName}@2x.webp`;
  const retinaWebpPath = join(pathParse(basePath).dir, retinaWebpName);
  const retinaWebpResult = await writeWebp(sharp, retinaPngPath, retinaWebpPath);

  return {
    webp: webpName,
    webpSize: webpResult.size,
    retinaPng: retinaPngName,
    retinaWebp: retinaWebpName,
    retinaWebpSize: retinaWebpResult.size,
    width: w,
    height: h,
    hasAlpha: meta.hasAlpha ?? false,
  };
}

export function writeLogoArtifacts(root, destDir, resolved, sourceDir, derivatives = {}) {
  const files = {
    transparent: resolved.transparent ?? "Logo_Transparent.png",
    print: resolved.print ?? "Logo_Print.png",
    negative: resolved.negative ?? "Logo_Negative.png",
  };

  const webp = {};
  const retina = {};
  for (const variant of ["transparent", "print", "negative"]) {
    const d = derivatives[variant];
    if (d) {
      webp[variant] = d.webp;
      retina[variant] = { png: d.retinaPng, webp: d.retinaWebp };
    } else {
      const base = pathParse(files[variant]).name;
      webp[variant] = `${base}.webp`;
      retina[variant] = { png: `${base}@2x.png`, webp: `${base}@2x.webp` };
    }
  }

  writeFileSync(
    join(destDir, "manifest.json"),
    JSON.stringify(
      {
        sourceDir,
        syncedAt: new Date().toISOString(),
        version: "v23.2.3",
        files,
        webp,
        retina,
        derivatives,
      },
      null,
      2
    )
  );

  writeFileSync(
    join(root, "lib", "brand", "logo-paths.generated.ts"),
    `/** AUTO-GENERATED — scripts/sync-logos.mjs — do not edit */\nexport const LOGO_FILES = ${JSON.stringify(files, null, 2)} as const;\n\nexport const LOGO_WEBP = ${JSON.stringify(webp, null, 2)} as const;\n\nexport const LOGO_RETINA = ${JSON.stringify(retina, null, 2)} as const;\n`
  );
}

export async function syncLogosFromSource({ root, sourceDir = DEFAULT_SOURCE_DIR }) {
  const destDir = join(root, "public", "assets", "logo");
  mkdirSync(destDir, { recursive: true });

  const sharp = await loadSharp();
  const resolved = {};
  const derivatives = {};
  const log = [];
  const errors = [];

  for (const { dest, sources, variant, requireAlpha } of CANONICAL) {
    let copied = false;
    for (const src of sources) {
      const srcPath = join(sourceDir, src);
      if (!existsSync(srcPath)) continue;
      const buf = readFileSync(srcPath);
      const finalName = resolveDestFilename(dest, buf);
      const destPath = join(destDir, finalName);
      copyFileSync(srcPath, destPath);
      resolved[variant] = finalName;
      log.push({ src, dest: finalName });

      if (sharp) {
        try {
          const baseName = pathParse(finalName).name;
          const d = await generateDerivatives(sharp, destPath, baseName);
          derivatives[variant] = d;

          if (requireAlpha && !d.hasAlpha && finalName.endsWith(".png")) {
            log.push({ warn: `${variant}: transparent PNG has no alpha — using opaque source` });
          }
          if (d.webpSize > MAX_WEBP_BYTES) {
            errors.push(`${variant}: WebP exceeds 500 KB (${d.webpSize})`);
          }
          if (d.width < 512 && d.height < 512 && variant === "transparent") {
            log.push({ warn: `${variant}: dimensions ${d.width}x${d.height} below 512px` });
          }
          log.push({
            derived: `${baseName}.webp, ${baseName}@2x.png, ${baseName}@2x.webp`,
          });
        } catch (e) {
          errors.push(`${variant}: derivative generation failed — ${e.message}`);
        }
      } else {
        log.push({ warn: "sharp unavailable — skipped WebP/@2x generation" });
      }

      copied = true;
      break;
    }
    if (!copied) {
      log.push({ missing: dest, sources });
      errors.push(`Missing source for ${dest}`);
    }
  }

  writeLogoArtifacts(root, destDir, resolved, sourceDir, derivatives);

  if (errors.length) {
    const err = new Error(`Logo sync validation failed:\n${errors.join("\n")}`);
    err.log = log;
    err.resolved = resolved;
    throw err;
  }

  return { resolved, derivatives, log, destDir };
}

/** Regenerate WebP/@2x after admin upload without re-copying from D: */
export async function processUploadedLogo({ root, variant, filename }) {
  const destDir = join(root, "public", "assets", "logo");
  const destPath = join(destDir, filename);
  if (!existsSync(destPath)) throw new Error(`Uploaded file not found: ${filename}`);

  const sharp = await loadSharp();
  if (!sharp) throw new Error("sharp unavailable for derivative generation");

  const manifestPath = join(destDir, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf8"))
    : { files: {}, derivatives: {} };

  const baseName = pathParse(filename).name;
  const d = await generateDerivatives(sharp, destPath, baseName);
  manifest.files = { ...manifest.files, [variant]: filename };
  manifest.derivatives = { ...manifest.derivatives, [variant]: d };
  manifest.syncedAt = new Date().toISOString();
  manifest.version = "v23.2.3";

  const resolved = {
    transparent: manifest.files.transparent ?? "Logo_Transparent.png",
    print: manifest.files.print ?? "Logo_Print.jpg",
    negative: manifest.files.negative ?? "Logo_Negative.jpg",
  };

  writeLogoArtifacts(root, destDir, resolved, manifest.sourceDir ?? DEFAULT_SOURCE_DIR, manifest.derivatives);
  return { filename, derivatives: d };
}
