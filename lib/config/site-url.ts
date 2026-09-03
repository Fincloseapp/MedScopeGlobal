/** Canonical site origin — Cloudflare Workers / OpenNext. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const cf = process.env.CF_PAGES_URL?.trim();
  if (cf) {
    return cf.startsWith("http") ? cf.replace(/\/$/, "") : `https://${cf.replace(/\/$/, "")}`;
  }

  return "https://medscopeglobal.com";
}
