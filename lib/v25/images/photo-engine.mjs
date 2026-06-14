/**
 * v25.1 Photo engine — DALL-E 3 raster covers with fair-skinned hands; curated fallback.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSafePrompt } from "./style-filter.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..", "..");

/** Curated European medical stock (white-gloved hands, clinical settings). */
const CURATED_PHOTOS = {
  medicina: "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  study: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  drug: "https://images.unsplash.com/photo-1584308664744-24d5c474f2ae?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  legislation: "https://images.unsplash.com/photo-1589829545855-d10d557cf95f?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  digitalHealth: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  university: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  congress: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  anatomy: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
  verejnost: "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp",
};

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

function photoPrompt(input) {
  const base = buildSafePrompt({
    title: input.title,
    topics: input.keywords,
    imageType: input.imageType ?? "illustration",
    section: input.section,
  });
  return [
    base,
    "Photorealistic editorial medical photography.",
    "European hospital or clinic environment.",
    "If human hands are visible: white-skinned hands only, wearing white clinical gloves or holding medical tools.",
    "No identifiable faces, no text overlays, no watermarks.",
    "Soft natural lighting, trustworthy professional mood.",
  ].join(" ");
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
  const base = CURATED_PHOTOS[key] ?? CURATED_PHOTOS.medicina;
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
 * @param {{ section: string; slug: string; title: string; module?: string; keywords?: string[]; imageType?: string }} input
 */
export async function generatePhotoBuffer(input) {
  const prompt = photoPrompt(input);
  const aiBuf = await generateOpenAiPhoto(prompt);
  if (aiBuf) {
    return { ok: true, buffer: aiBuf, contentType: "image/png", ext: "png", source: "openai", prompt };
  }

  const curated = await fetchCuratedPhoto(input.module ?? input.section, input.slug);
  if (curated) {
    return { ok: true, ...curated, prompt };
  }

  return { ok: false, error: "photo-generation-failed" };
}

export { CURATED_PHOTOS, photoPrompt };
