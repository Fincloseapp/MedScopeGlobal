import { SITE } from "@/lib/config/site";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export type ShareNetwork = "facebook" | "whatsapp" | "linkedin" | "x";

export function publicAbsoluteUrl(path: string, locale = "cs", origin = SITE.url): string {
  const localized = path.startsWith("http") ? path : localizePublicHref(path, locale);
  if (localized.startsWith("http")) return localized;
  return `${origin.replace(/\/$/, "")}${localized}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function whatsappShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function linkedinShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function xShareUrl(title: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
}

export function shareText(title: string, url: string): string {
  return `${title} ${url}`.trim();
}

export function buildShareIntents(input: { title: string; url: string }): Record<ShareNetwork, string> {
  const text = shareText(input.title, input.url);
  return {
    facebook: facebookShareUrl(input.url),
    whatsapp: whatsappShareUrl(text),
    linkedin: linkedinShareUrl(input.url),
    x: xShareUrl(input.title, input.url),
  };
}

/** True only for a real video file — never for TTS audio used as a slideshow. */
export function isShareableVideoUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp3|m4a|aac|wav|ogg)$/.test(clean)) return false;
  return /\.(mp4|webm|m3u8)$/.test(clean) || /\/video\//i.test(url);
}
