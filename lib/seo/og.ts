import { SITE } from "@/lib/config/site";

/** Unique filename so WhatsApp does not reuse an old 404 for /og-default.png. */
export const OG_DEFAULT_PATH = "/og-medscopeglobal.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type OgImageSpec = {
  url: string;
  secureUrl?: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
};

export function ogDefaultAbsolute(): string {
  return `${SITE.url}${OG_DEFAULT_PATH}`;
}

export function ogImages(title: string, extra?: string | null): OgImageSpec[] {
  const branded: OgImageSpec = {
    url: ogDefaultAbsolute(),
    secureUrl: ogDefaultAbsolute(),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: "MedScopeGlobal.com",
    type: "image/jpeg",
  };
  if (extra && /^https?:\/\//i.test(extra) && extra !== branded.url) {
    return [
      branded,
      { url: extra, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: title },
    ];
  }
  return [branded];
}
