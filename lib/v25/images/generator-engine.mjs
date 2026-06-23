/**
 * v25.1 AI Image Generator — professional neutral SVG covers (no race/ethnicity).
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { dataPath, ensureDir, writeJson } from "../shared.mjs";
import { filterImageStyle, buildSafePrompt } from "./style-filter.mjs";
import { getCategoryTemplate, resolveCategoryKey } from "./category-templates.mjs";

const PALETTE = {
  bg: "#f0f7ff",
  card: "#ffffff",
  primary: "#021d33",
  accent: "#0f3d5c",
  line: "#c5d9e8",
  soft: "#6b7c8f",
};

const MODULE_ICONS = {
  study: `<circle cx="520" cy="100" r="36" fill="${PALETTE.line}" opacity="0.5"/><path d="M500 100 L520 85 L540 100 L520 115 Z" fill="${PALETTE.accent}"/>`,
  drug: `<rect x="490" y="75" width="60" height="50" rx="8" fill="${PALETTE.line}"/><rect x="505" y="88" width="30" height="24" rx="4" fill="${PALETTE.accent}"/>`,
  legislation: `<rect x="490" y="70" width="44" height="56" rx="4" fill="${PALETTE.line}"/><line x1="500" y1="88" x2="524" y2="88" stroke="${PALETTE.accent}" stroke-width="3"/><line x1="500" y1="100" x2="524" y2="100" stroke="${PALETTE.accent}" stroke-width="3"/>`,
  digitalHealth: `<rect x="495" y="72" width="50" height="52" rx="10" fill="${PALETTE.line}"/><circle cx="520" cy="98" r="12" fill="${PALETTE.accent}"/>`,
  university: `<rect x="485" y="95" width="70" height="35" fill="${PALETTE.line}"/><polygon points="485,95 520,65 555,95" fill="${PALETTE.accent}"/>`,
  congress: `<rect x="488" y="78" width="64" height="40" rx="6" fill="${PALETTE.line}"/><circle cx="505" cy="98" r="6" fill="${PALETTE.accent}"/><circle cx="520" cy="98" r="6" fill="${PALETTE.accent}"/><circle cx="535" cy="98" r="6" fill="${PALETTE.accent}"/>`,
  medicina: `<circle cx="520" cy="98" r="28" fill="${PALETTE.line}"/><path d="M520 82 v32 M504 98 h32" stroke="${PALETTE.accent}" stroke-width="4" stroke-linecap="round"/>`,
  anatomy: `<ellipse cx="520" cy="98" rx="22" ry="30" fill="${PALETTE.line}"/><path d="M508 88 Q520 75 532 88" stroke="${PALETTE.accent}" fill="none" stroke-width="2"/>`,
  interview: `<rect x="500" y="78" width="18" height="42" rx="9" fill="${PALETTE.accent}"/><ellipse cx="509" cy="72" rx="14" ry="8" fill="${PALETTE.line}"/><rect x="528" y="88" width="36" height="8" rx="4" fill="${PALETTE.soft}" opacity="0.6"/>`,
  verejnost: `<circle cx="520" cy="98" r="32" fill="${PALETTE.line}" opacity="0.45"/><path d="M500 110 h40" stroke="${PALETTE.accent}" stroke-width="3" stroke-linecap="round"/>`,
};

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hashSlug(section, slug) {
  return createHash("sha256").update(`${section}:${slug}`).digest("hex").slice(0, 12);
}

function wrapTitle(title, max = 56) {
  const t = (title ?? "MedScope").slice(0, max);
  if (t.length <= 32) return [t];
  const mid = t.lastIndexOf(" ", 32);
  const split = mid > 10 ? mid : 32;
  return [t.slice(0, split), t.slice(split).trim()];
}

function environmentDecor() {
  return `
  <rect x="0" y="180" width="640" height="140" fill="${PALETTE.line}" opacity="0.35"/>
  <rect x="40" y="200" width="120" height="80" rx="6" fill="${PALETTE.card}" stroke="${PALETTE.line}"/>
  <rect x="180" y="190" width="90" height="90" rx="6" fill="${PALETTE.card}" stroke="${PALETTE.line}"/>
  <rect x="290" y="205" width="100" height="75" rx="6" fill="${PALETTE.card}" stroke="${PALETTE.line}"/>
  <line x1="40" y1="240" x2="560" y2="240" stroke="${PALETTE.line}" stroke-width="2"/>`;
}

function objectDecor(keywords) {
  const label = escapeXml((keywords ?? ["objekt"])[0]?.slice(0, 18) ?? "objekt");
  return `
  <rect x="420" y="160" width="160" height="120" rx="16" fill="${PALETTE.card}" stroke="${PALETTE.line}"/>
  <text x="500" y="230" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="${PALETTE.accent}">${label}</text>`;
}

function iconDecor() {
  return `
  <circle cx="520" cy="200" r="48" fill="${PALETTE.card}" stroke="${PALETTE.line}" stroke-width="2"/>
  <text x="520" y="210" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="${PALETTE.accent}">?</text>`;
}

function illustrationDecor(keywords) {
  const items = (keywords ?? []).slice(0, 3);
  return items
    .map(
      (kw, i) =>
        `<text x="48" y="${200 + i * 28}" font-family="system-ui,sans-serif" font-size="14" fill="${PALETTE.accent}">• ${escapeXml(kw.slice(0, 42))}</text>`
    )
    .join("");
}

/**
 * @param {{ section: string; slug: string; title: string; imageType?: string; module?: string; keywords?: string[]; prompt?: string }} input
 */
export function generateImageSvg(input) {
  let imageType = input.imageType ?? "illustration";
  let themeKey = input.module ?? "medicina";
  const titleLines = wrapTitle(input.title);
  const categoryKey = input.category ?? resolveCategoryKey(input);
  const tpl = getCategoryTemplate(categoryKey);
  const alt = buildSafePrompt({
    title: input.title,
    topics: input.keywords,
    imageType: tpl?.imageType ?? imageType,
    section: input.section,
    categoryExtra: tpl?.promptExtra,
  });
  if (tpl?.module) themeKey = tpl.module;
  if (tpl?.imageType) imageType = tpl.imageType;

  let decor = illustrationDecor(input.keywords);
  if (themeKey === "drug") decor = objectDecor(["léčivo"]);
  else if (imageType === "environment") decor = environmentDecor();
  else if (imageType === "object") decor = objectDecor(input.keywords);
  else if (imageType === "icon") decor = iconDecor();

  const icon = MODULE_ICONS[themeKey] ?? MODULE_ICONS.medicina;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img" aria-label="${escapeXml(alt)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.bg}"/>
      <stop offset="100%" stop-color="#e8f2fa"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="24" y="24" width="752" height="402" rx="20" fill="${PALETTE.card}" stroke="${PALETTE.line}"/>
  <text x="48" y="72" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="${PALETTE.soft}" letter-spacing="0.04em">medscopeglobal.com</text>
  <text x="48" y="${titleLines.length > 1 ? 108 : 118}" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="${PALETTE.primary}">${escapeXml(titleLines[0])}</text>
  ${titleLines[1] ? `<text x="48" y="142" font-family="system-ui,sans-serif" font-size="26" font-weight="700" fill="${PALETTE.primary}">${escapeXml(titleLines[1])}</text>` : ""}
  ${decor}
  ${icon}
</svg>`;

  const style = filterImageStyle(svg, { alt, prompt: input.prompt, imageType });
  return { svg, alt, style, imageType, module: themeKey };
}

/**
 * Save raster photo (preferred) or minimal SVG fallback.
 */
export async function saveGeneratedImageAsync(input) {
  const { generatePhotoBuffer } = await import("./photo-engine.mjs");
  const section = input.section.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const slug = input.slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();

  const photo = await generatePhotoBuffer({
    section: input.section,
    slug: input.slug,
    title: input.title,
    module: input.module ?? "medicina",
    keywords: input.keywords ?? [],
    imageType: input.imageType,
  });

  if (photo.ok && photo.buffer) {
    const rel = join("images", section, `${slug}.${photo.ext}`);
    const full = dataPath(rel);
    ensureDir(dirname(full));
    writeFileSync(full, photo.buffer);

    const meta = {
      at: new Date().toISOString(),
      section,
      slug: input.slug,
      title: input.title,
      imageType: input.imageType ?? "illustration",
      module: input.module ?? "medicina",
      alt: input.title,
      hash: hashSlug(section, slug),
      localPath: full,
      relativePath: rel.replace(/\\/g, "/"),
      source: photo.source ?? "openai",
      stylePassed: true,
      keywords: input.keywords ?? [],
      contentType: photo.contentType,
    };
    writeJson(`images/${section}/${slug}.meta.json`, meta);
    return { ok: true, meta, relativePath: meta.relativePath, contentType: photo.contentType };
  }

  return saveGeneratedImage(input);
}

/**
 * Save SVG to D:\\medscope.data\\images\\{section}\\{slug}.svg
 */
export function saveGeneratedImage(input) {
  const { svg, alt, style, imageType, module: themeKey } = generateImageSvg(input);
  if (!style.passed) {
    return { ok: false, error: "style-filter-rejected", rejected: style.rejected };
  }

  const section = input.section.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const slug = input.slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const rel = join("images", section, `${slug}.svg`);
  const full = dataPath(rel);
  ensureDir(dirname(full));
  writeFileSync(full, svg, "utf8");

  const hash = hashSlug(section, slug);
  const meta = {
    at: new Date().toISOString(),
    section,
    slug: input.slug,
    title: input.title,
    imageType,
    module: themeKey,
    alt,
    hash,
    localPath: full,
    relativePath: rel.replace(/\\/g, "/"),
    source: "generator",
    stylePassed: true,
    keywords: input.keywords ?? [],
  };

  writeJson(`images/${section}/${slug}.meta.json`, meta);

  return { ok: true, meta, svg, relativePath: meta.relativePath };
}

export { hashSlug, generateImageSvg as generateImage };
