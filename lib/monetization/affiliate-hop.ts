/**
 * Public /go hop — the reader stays on medscopeglobal.com until we
 * hand off. Tracking (haff, Amazon tag) is attached only on the outbound URL.
 */

import { AFFILIATE_PRODUCTS } from "@/lib/ecosystem/monetization";
import { MAGAZINE } from "@/lib/brand/magazine";
import { parseAffiliateSlug } from "@/lib/monetization/affiliate-geo";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

export type AffiliateHopCopy = {
  kicker: string;
  body: string;
  continueLabel: string;
  backLabel: string;
  cta: string;
};

const HOP_COPY: Record<"cs" | "de" | "fr" | "en", AffiliateHopCopy> = {
  cs: {
    kicker: MAGAZINE.name,
    body: "Otevíráme srovnání cen u ověřených obchodů.",
    continueLabel: "Pokračovat",
    backLabel: "Zpět na článek",
    cta: "Porovnat ceny",
  },
  de: {
    kicker: MAGAZINE.name,
    body: "Wir öffnen einen Preisvergleich bei geprüften Händlern.",
    continueLabel: "Weiter",
    backLabel: "Zurück zum Artikel",
    cta: "Preise vergleichen",
  },
  fr: {
    kicker: MAGAZINE.name,
    body: "Nous ouvrons une comparaison de prix chez des commerçants vérifiés.",
    continueLabel: "Continuer",
    backLabel: "Retour à l’article",
    cta: "Comparer les prix",
  },
  en: {
    kicker: MAGAZINE.name,
    body: "Opening a price comparison at trusted shops.",
    continueLabel: "Continue",
    backLabel: "Back to the article",
    cta: "Compare prices",
  },
};

export function affiliateHopCopy(locale?: string | null): AffiliateHopCopy {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return HOP_COPY.cs;
  if (primary === "de") return HOP_COPY.de;
  if (primary === "fr") return HOP_COPY.fr;
  return HOP_COPY.en;
}

export function productDisplayName(productId: string, locale?: string | null): string {
  const product = AFFILIATE_PRODUCTS.find((item) => item.id === productId);
  if (!product) return productId.replace(/-/g, " ");
  const loc = locale ?? "cs";
  const primary = primaryArticleLocale(normalizeLocale(loc));
  return (
    product.name[loc] ??
    product.name[primary] ??
    product.name.cs ??
    product.name.en ??
    productId.replace(/-/g, " ")
  );
}

export function productImageForHop(productId: string): string | null {
  return AFFILIATE_PRODUCTS.find((item) => item.id === productId)?.imageUrl ?? null;
}

export function productIdFromGoSlug(slug: string): string | null {
  return parseAffiliateSlug(slug)?.productId ?? null;
}

export function isDirectAffiliateHop(url: URL): boolean {
  return url.searchParams.get("direct") === "1";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Magazine interstitial. Destination is not shown as a link or in visible copy. */
export function publicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com").replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function renderAffiliateHopHtml(input: {
  destination: string;
  locale?: string | null;
  productName: string;
  imageUrl?: string | null;
  autoLeaveMs?: number;
}): string {
  const copy = affiliateHopCopy(input.locale);
  const name = escapeHtml(input.productName);
  const imageSrc = publicAssetUrl(input.imageUrl);
  const image = imageSrc
    ? `<img src="${escapeHtml(imageSrc)}" alt="" width="160" height="200" style="width:160px;height:200px;object-fit:cover;border-radius:18px;border:1px solid #cfe1f3;background:#e8f3fb;box-shadow:0 12px 40px rgba(2,29,51,.12);"/>`
    : "";
  const destJson = JSON.stringify(input.destination);
  const delay =
    input.autoLeaveMs === 0
      ? 0
      : Number.isFinite(input.autoLeaveMs)
        ? Math.max(400, input.autoLeaveMs as number)
        : 1800;

  return `<!doctype html>
<html lang="${escapeHtml((input.locale || "cs").slice(0, 2))}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>${escapeHtml(MAGAZINE.name)} · ${name}</title>
  <style>
    :root { color-scheme: light; }
    html,body { margin:0; min-height:100%; background:linear-gradient(180deg,#e8f3fb 0%,#f7fafc 42%,#ffffff 100%); }
    body { font-family: Georgia, "Times New Roman", serif; color:#021d33; display:flex; align-items:center; justify-content:center; }
    .card { width:min(440px, calc(100% - 32px)); margin:32px auto; text-align:center; }
    .kicker { letter-spacing:.22em; text-transform:uppercase; font-size:11px; font-family:system-ui,sans-serif; color:#005B96; font-weight:700; }
    h1 { margin:14px 0 8px; font-size:28px; line-height:1.2; }
    .lead { margin:0 auto 22px; max-width:34ch; font-size:16px; line-height:1.5; color:#334155; }
    button { appearance:none; border:0; cursor:pointer; background:#021d33; color:#fff; border-radius:999px; padding:12px 22px; font:600 14px/1 system-ui,sans-serif; }
    button:hover { background:#005B96; }
    .back { display:inline-block; margin-top:16px; font:14px/1.4 system-ui,sans-serif; color:#64748b; text-decoration:none; }
    .back:hover { color:#021d33; }
  </style>
</head>
<body>
  <main class="card">
    <p class="kicker">${escapeHtml(copy.kicker)}</p>
    ${image}
    <h1>${name}</h1>
    <p class="lead">${escapeHtml(copy.body)}</p>
    <button type="button" id="vlv-go-btn">${escapeHtml(copy.continueLabel)}</button>
    <a class="back" href="/">${escapeHtml(copy.backLabel)}</a>
  </main>
  <script type="application/json" id="vlv-go">${destJson}</script>
  <script>
    (function () {
      function dest() {
        try {
          var el = document.getElementById("vlv-go");
          return el ? JSON.parse(el.textContent || "null") : "";
        } catch (e) { return ""; }
      }
      function go() {
        var next = dest();
        if (next) window.location.replace(next);
      }
      var btn = document.getElementById("vlv-go-btn");
      if (btn) btn.addEventListener("click", go);
      ${delay > 0 ? `window.setTimeout(go, ${delay});` : ""}
    })();
  </script>
</body>
</html>`;
}

export function hopHtmlHidesTracking(html: string): boolean {
  const withoutPayload = html.replace(
    /<script type="application\/json" id="vlv-go">[\s\S]*?<\/script>/,
    ""
  );
  return (
    !/haff=/i.test(withoutPayload) &&
    !/utm_medium=affiliate/i.test(withoutPayload) &&
    !/tag=vialongevita/i.test(withoutPayload) &&
    !/heureka\.cz\/\?/i.test(withoutPayload) &&
    !/amazon\.(com|de|fr|es|it|co\.uk)/i.test(withoutPayload)
  );
}
