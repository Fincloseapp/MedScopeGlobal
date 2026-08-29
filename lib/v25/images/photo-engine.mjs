/**
 * v25.2 Photo engine — DALL-E 3 raster covers with European gloved hands; category prompts.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSafePrompt, filterImageStyle } from "./style-filter.mjs";
import { getCategoryTemplate, resolveCategoryKey } from "./category-templates.mjs";
import { hasBadUnsplashId } from "./bad-unsplash-ids.mjs";
import {
  SAFE_CURATED_PHOTOS,
  buildEditorialImageGuidance,
  isBannedCoverUrl,
} from "../../editorial/image-policy.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");

/** Curated European medical stock — gated by editorial image policy. */
const CURATED_PHOTOS = { ...SAFE_CURATED_PHOTOS };

const HANDS_EMPHASIS = [
  "Photorealistic editorial medical photography or clean 3D medical illustration.",
  "European hospital, clinic, or Czech university medical setting.",
  "Prefer medical equipment, diagrams, abstract health visuals, or gloved hands — no identifiable faces.",
  "If human hands are visible: professional clinical gloves, neutral European medical context.",
  "Educational-popular style: engaging, trustworthy, magazine-quality — not generic stock photo clichés.",
  "No text overlays, no watermarks, no demographic stereotypes.",
  "Never depict a plastic brain anatomical model on a stick/stand.",
  buildEditorialImageGuidance(),
];

function loadEnvLocal() {
  for (const name of [".env", ".env.local"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function photoPrompt(input, attempt = 0) {
  const categoryKey = input.category ?? resolveCategoryKey(input);
  const tpl = getCategoryTemplate(categoryKey);
  const base = buildSafePrompt({
    title: input.title,
    topics: input.keywords,
    imageType: input.imageType ?? "illustration",
    section: input.section,
    categoryExtra: tpl?.promptExtra ?? input.categoryExtra,
    excerpt: input.excerpt ?? input.metadata?.excerpt,
  });
  const retryBoost =
    attempt > 0
      ? ` Regeneration attempt ${attempt + 1}: strictly professional clinical imagery, gloved hands or equipment only, no identifiable faces.`
      : "";
  return [base, ...HANDS_EMPHASIS, retryBoost].filter(Boolean).join(" ");
}

async function generateOpenAiPhoto(prompt) {
  loadEnvLocal();
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key?.startsWith("sk-")) return null;

  const model = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: prompt.slice(0, 4000),
        n: 1,
        size: "1792x1024",
        quality: "standard",
        response_format: "b64_json",
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return null;
    return Buffer.from(b64, "base64");
  } catch {
    return null;
  }
}

async function fetchCuratedPhoto(module, slug) {
  const key = module ?? "medicina";
  let base = CURATED_PHOTOS[key] ?? CURATED_PHOTOS.medicina;
  if (isBannedCoverUrl(base) || hasBadUnsplashId(base)) {
    base = CURATED_PHOTOS.medicina;
  }
  if (base.startsWith("/")) {
    // Local brand asset — skip remote fetch; pipeline reads from public/
    return null;
  }
  if (hasBadUnsplashId(base)) return null;
  const sig = slug ? `&sig=${Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999)}` : "";
  const url = `${base}${sig}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") ?? "image/webp";
    return { buffer: buf, contentType: ct.includes("png") ? "image/png" : "image/webp", ext: ct.includes("png") ? "png" : "webp", source: "curated" };
  } catch {
    return null;
  }
}

/**
 * Generate raster photo buffer for content cover.
 * @param {{ section: string; slug: string; title: string; module?: string; keywords?: string[]; imageType?: string; category?: string; categoryExtra?: string; excerpt?: string; metadata?: Record<string, unknown> }} input
 */
export async function generatePhotoBuffer(input) {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const prompt = photoPrompt(input, attempt);
    const style = filterImageStyle(prompt, { prompt, requireHandsDirective: true });
    if (!style.passed) continue;

    const aiBuf = await generateOpenAiPhoto(prompt);
    if (aiBuf) {
      return { ok: true, buffer: aiBuf, contentType: "image/png", ext: "png", source: "openai", prompt, attempt: attempt + 1 };
    }
  }

  const curated = await fetchCuratedPhoto(input.module ?? input.section, input.slug);
  if (curated) {
    return { ok: true, ...curated, prompt: photoPrompt(input), attempt: 0 };
  }

  return { ok: false, error: "photo-generation-failed" };
}

export { CURATED_PHOTOS, photoPrompt };
