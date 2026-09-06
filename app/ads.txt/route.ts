import { ADSENSE_ADS_TXT } from "@/lib/monetization/adsense";

export const dynamic = "force-static";

export function GET() {
  return new Response(`${ADSENSE_ADS_TXT}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
