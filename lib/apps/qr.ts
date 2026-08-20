import { SITE } from "@/lib/config/site";
import type { AppProduct } from "@/lib/apps/catalog";

export function absoluteAppUrl(app: AppProduct, source = "qr"): string {
  const base = SITE.url.replace(/\/$/, "");
  const sep = app.appPath.includes("?") ? "&" : "?";
  return `${base}${app.appPath}${sep}source=${encodeURIComponent(source)}`;
}

export async function proxyQrPng(targetUrl: string): Promise<Buffer> {
  const api =
    "https://api.qrserver.com/v1/create-qr-code/?size=360x360&ecc=M&margin=2&data=" +
    encodeURIComponent(targetUrl);
  const res = await fetch(api, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`QR provider ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
