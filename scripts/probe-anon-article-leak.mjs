#!/usr/bin/env node
/**
 * Checks whether anonymous HTML / RSC / Supabase REST expose gated bodies.
 * Does not print article HTML or secrets.
 */
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...loadProjectEnv(ROOT), ...process.env };
const BASE = "https://medscopeglobal.com";

const TARGETS = [
  {
    name: "vip",
    slug: "revoluce-v-lb-hypercholesterolemie-genov-editace-pcsk9-v-praxi",
    needles: ["VERVE-102", "Limity a nejistoty"],
  },
  {
    name: "physician",
    slug: "farmakovigilance-hlaseni-sukl-v-ordinaci",
    needles: ["Dokumentace v kartě", "Limity a nejistoty"],
  },
];

function hasAny(hay, needles) {
  return needles.filter((n) => hay.includes(n));
}

const auth = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const out = [];
for (const target of TARGETS) {
  const url = `${BASE}/article/${target.slug}`;
  const htmlRes = await fetch(url, { headers: { "cache-control": "no-cache" } });
  const html = await htmlRes.text();
  const { data, error } = await auth
    .from("articles")
    .select("slug,title,excerpt,content,vip_only,min_access_level")
    .eq("slug", target.slug)
    .eq("published", true)
    .maybeSingle();
  const { data: card, error: cardError } = await auth
    .from("articles")
    .select("slug,title,excerpt,vip_only,min_access_level")
    .eq("slug", target.slug)
    .eq("published", true)
    .maybeSingle();

  const { data: quizProbe, error: quizError } = await auth
    .from("articles")
    .select("slug,quiz_json")
    .eq("slug", target.slug)
    .eq("published", true)
    .maybeSingle();

  const restContent = String(data?.content ?? "");
  out.push({
    name: target.name,
    url,
    htmlStatus: htmlRes.status,
    htmlHasGate:
      html.includes("součástí MedScope VIP") ||
      html.includes("Pokračujte ve čtení") ||
      html.includes("Odemknout předplatným"),
    htmlLeaksNeedles: hasAny(html, target.needles),
    restError: error?.message ?? null,
    restHasRow: Boolean(data),
    restContentChars: restContent.length,
    restLeaksNeedles: hasAny(restContent, target.needles),
    quizError: quizError?.message ?? null,
    quizHasPayload: Boolean(quizProbe?.quiz_json),
    cardError: cardError?.message ?? null,
    cardHasTitle: Boolean(card?.title),
  });
}

console.log(JSON.stringify({ anonKeyUsed: true, results: out }, null, 2));
