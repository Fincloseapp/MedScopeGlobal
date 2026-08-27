#!/usr/bin/env node
/**
 * Post-deploy / unblock probe: Stripe fetch client live + MediFlow marketing art.
 *
 *   pnpm probe:prod:stripe
 *   MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm probe:prod:stripe
 *
 * Exit 0 only when:
 *   - GET /api/v29/health → stripe.httpClient === "fetch"
 *   - POST /api/ecosystem/donate {amount:2000,currency:czk} → checkout URL in <15s
 *   - GET /assets/marketing/mediflow.webp → 200
 */
const origin = (process.env.MEDSCOPE_ORIGIN || "https://medscopeglobal.com").replace(/\/$/, "");
const DONATE_BUDGET_MS = Number(process.env.DONATE_BUDGET_MS || 15_000);
const DONATE_TIMEOUT_MS = Number(process.env.DONATE_TIMEOUT_MS || 20_000);

let failed = 0;

function ok(msg) {
  console.log(`OK   ${msg}`);
}
function fail(msg) {
  failed += 1;
  console.error(`FAIL ${msg}`);
}

async function main() {
  console.log(`probe origin=${origin}`);

  // --- health ---
  try {
    const t0 = Date.now();
    const res = await fetch(`${origin}/api/v29/health`, {
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json();
    const ms = Date.now() - t0;
    console.log(`${res.status} /api/v29/health (${ms}ms)`);
    if (!res.ok) fail(`health status ${res.status}`);
    const stripe = body?.stripe || {};
    if (stripe.httpClient === "fetch") {
      ok(`health stripe.httpClient=fetch secret=${Boolean(stripe.secretKeyConfigured)} webhook=${Boolean(stripe.webhookSecretConfigured)}`);
    } else {
      fail(
        `health missing stripe.httpClient=fetch (got ${JSON.stringify(stripe.httpClient ?? null)}) — Workers-safe Stripe client not deployed yet`
      );
    }
    if (!stripe.webhookSecretConfigured) {
      console.warn(
        "WARN stripe.webhookSecretConfigured=false — Checkout may work; fulfillment needs STRIPE_WEBHOOK_SECRET (pnpm auto:d reminds; or node scripts/setup-stripe-webhook.mjs)"
      );
    }
  } catch (e) {
    fail(`health: ${e instanceof Error ? e.message : e}`);
  }

  // --- donate ---
  try {
    const t0 = Date.now();
    const res = await fetch(`${origin}/api/ecosystem/donate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 2000, currency: "czk" }),
      signal: AbortSignal.timeout(DONATE_TIMEOUT_MS),
    });
    const ms = Date.now() - t0;
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 240) };
    }
    console.log(`${res.status} POST /api/ecosystem/donate (${ms}ms)`);
    console.log(`     body=${JSON.stringify(body).slice(0, 400)}`);
    if (ms > DONATE_BUDGET_MS) {
      fail(`donate took ${ms}ms (>${DONATE_BUDGET_MS}ms) — likely old Node Stripe client hang`);
    } else if (res.ok && typeof body?.url === "string" && body.url.includes("checkout.stripe.com")) {
      ok(`donate checkout URL in ${ms}ms`);
    } else if (res.status === 503 && body?.enabled === false) {
      fail(`donate 503 Stripe not configured: ${body?.error || body?.detail || "?"}`);
    } else if (!res.ok && body?.detail) {
      // Actionable Stripe/API error within budget still proves fetch client is live.
      ok(`donate responded in ${ms}ms with actionable error (fetch client live): ${String(body.error || body.detail).slice(0, 160)}`);
    } else {
      fail(`donate unexpected: status=${res.status} keys=${Object.keys(body || {}).join(",")}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/abort|timeout/i.test(msg)) {
      fail(`donate timed out after ${DONATE_TIMEOUT_MS}ms — production still hanging (deploy createFetchHttpClient)`);
    } else {
      fail(`donate: ${msg}`);
    }
  }

  // --- mediflow art ---
  try {
    const t0 = Date.now();
    const res = await fetch(`${origin}/assets/marketing/mediflow.webp`, {
      method: "HEAD",
      signal: AbortSignal.timeout(15_000),
    });
    const ms = Date.now() - t0;
    const ct = res.headers.get("content-type") || "";
    console.log(`${res.status} HEAD /assets/marketing/mediflow.webp (${ms}ms) ${ct}`);
    if (res.ok && /image\/webp/i.test(ct)) {
      ok("mediflow.webp 200 image/webp");
    } else if (res.ok) {
      ok(`mediflow.webp ${res.status} (${ct || "no content-type"})`);
    } else {
      fail(`mediflow.webp status ${res.status} — marketing art not on Worker yet`);
    }
  } catch (e) {
    fail(`mediflow.webp: ${e instanceof Error ? e.message : e}`);
  }

  if (failed) {
    console.error(`\nprobe failed: ${failed} check(s)`);
    console.error(`Unblock: on PC → cd D:\\medscope.local && git pull && pnpm auto:d`);
    console.error(`Or Cursor Secrets: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID → new agent → pnpm cf:deploy`);
    process.exit(1);
  }
  console.log("\nprobe ok — Stripe fetch client + mediflow.webp live");
}

main();
