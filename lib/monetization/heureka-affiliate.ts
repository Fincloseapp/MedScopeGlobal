/**
 * Official Heureka Affiliate tracking (Trixam).
 * Direct heureka.cz search URLs do not pay — clicks must go through
 * `heureka-affiliate-link` + data-trixam-positionid + serve.affiliate.heureka.cz.
 */

import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { applyMonetizationSettingsSchema } from "@/lib/monetization/apply-schema";
import { MAGAZINE } from "@/lib/brand/magazine";

export const HEUREKA_TRIXAM_SCRIPT = "https://serve.affiliate.heureka.cz/js/trixam.min.js";
export const HEUREKA_CZ_POSITION_KEY = "heureka_cz_position_id";
export const HEUREKA_SK_POSITION_KEY = "heureka_sk_position_id";

const cache = new Map<string, { id: string | null; at: number }>();
const CACHE_MS = 30_000;

export function parseHeurekaPositionId(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const attr = text.match(/data-trixam-positionid\s*=\s*["']?(\d{2,12})/i);
  if (attr?.[1]) return attr[1];
  const txpos = text.match(/txpos_(\d{2,12})/i);
  if (txpos?.[1]) return txpos[1];
  if (/^\d{2,12}$/.test(text)) return text;
  return null;
}

function envPosition(market: "cz" | "sk"): string | null {
  const named =
    market === "sk"
      ? process.env.AFFILIATE_HEUREKA_SK_POSITION_ID
      : process.env.AFFILIATE_HEUREKA_CZ_POSITION_ID;
  const fromNamed = parseHeurekaPositionId(named ?? "");
  if (fromNamed) return fromNamed;
  const template =
    market === "sk"
      ? process.env.AFFILIATE_HEUREKA_SK_TEMPLATE
      : process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE;
  return parseHeurekaPositionId(template ?? "");
}

export async function getHeurekaPositionId(market: "cz" | "sk"): Promise<string | null> {
  const fromEnv = envPosition(market);
  if (fromEnv) return fromEnv;

  const cached = cache.get(market);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.id;

  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    cache.set(market, { id: null, at: Date.now() });
    return null;
  }

  const key = market === "sk" ? HEUREKA_SK_POSITION_KEY : HEUREKA_CZ_POSITION_KEY;
  const { data } = await admin
    .from("monetization_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const id = parseHeurekaPositionId(String(data?.value ?? ""));
  cache.set(market, { id, at: Date.now() });
  return id;
}

export function forgetHeurekaPositionCache(): void {
  cache.clear();
}

export async function saveHeurekaPositionId(
  market: "cz" | "sk",
  raw: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const id = parseHeurekaPositionId(raw);
  if (!id) {
    return { ok: false, error: "Vložte číslo data-trixam-positionid nebo celý HTML kód z webmastera." };
  }

  const schema = await applyMonetizationSettingsSchema();
  const admin = tryCreateServiceRoleClient();
  if (!admin) return { ok: false, error: "Chybí service role — nelze uložit." };

  const key = market === "sk" ? HEUREKA_SK_POSITION_KEY : HEUREKA_CZ_POSITION_KEY;
  const { error } = await admin.from("monetization_settings").upsert({
    key,
    value: id,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    const hint = schema.ok ? "" : ` (${schema.error ?? "tabulka monetization_settings se nepodařila založit"})`;
    return { ok: false, error: `${error.message}${hint}` };
  }
  cache.set(market, { id, at: Date.now() });
  return { ok: true, id };
}

export function heurekaMarketFromUrl(url: string): "cz" | "sk" | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (/(^|\.)heureka\.sk$/i.test(host)) return "sk";
    if (/(^|\.)heureka\.cz$/i.test(host)) return "cz";
  } catch {
    /* ignore */
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Official Trixam hop — Heureka counts the click, then the reader lands on search. */
export function heurekaHopHtml(input: { destination: string; positionId: string }): string {
  const dest = escapeHtml(input.destination);
  const pos = escapeHtml(input.positionId);
  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8"/>
  <meta name="robots" content="noindex"/>
  <title>${escapeHtml(MAGAZINE.name)} · Heureka</title>
  <script src="${HEUREKA_TRIXAM_SCRIPT}"></script>
</head>
<body style="margin:0;background:#f4f7fb;font-family:Georgia,serif;color:#021d33;display:flex;min-height:100vh;align-items:center;justify-content:center;">
  <div style="text-align:center;padding:32px;">
    <p style="letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:#005B96;">${escapeHtml(MAGAZINE.name)}</p>
    <p style="margin:12px 0 20px;">Otevíráme Heureku…</p>
    <a id="heureka-hop"
       class="heureka-affiliate-link"
       data-trixam-positionid="${pos}"
       href="${dest}"
       target="_top"
       rel="nofollow sponsored">Pokračovat na Heureku</a>
  </div>
  <script>
    (function () {
      var el = document.getElementById("heureka-hop");
      function go() { try { el && el.click(); } catch (e) {} }
      window.addEventListener("load", function () { setTimeout(go, 350); });
      setTimeout(function () {
        if (el && document.visibilityState !== "hidden") {
          window.location = el.getAttribute("href");
        }
      }, 1600);
    })();
  </script>
</body>
</html>`;
}
