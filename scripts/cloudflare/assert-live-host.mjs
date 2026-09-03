#!/usr/bin/env node
/**
 * Confirm medscopeglobal.com is served by Cloudflare Workers.
 */
const origin = process.env.MEDSCOPE_ORIGIN || "https://medscopeglobal.com";
const ua = "Mozilla/5.0 (compatible; MedScopeCloudflareAssert/1.0)";

async function headers(path) {
  const res = await fetch(`${origin}${path}`, {
    method: "HEAD",
    redirect: "manual",
    headers: { "user-agent": ua, "accept-language": "cs" },
  });
  const out = {};
  res.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return { status: res.status, headers: out };
}

function assert(cond, message) {
  if (!cond) {
    console.error(`✗ ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

const home = await headers("/cs");
assert(home.status === 200, `/cs → ${home.status}`);
assert(/cloudflare/i.test(home.headers.server || ""), `server is Cloudflare (${home.headers.server || "missing"})`);
assert(Boolean(home.headers["cf-ray"]), "cf-ray present");
assert(!home.headers["x-vercel-id"], "no x-vercel-id");
assert(!home.headers["x-vercel-cache"], "no x-vercel-cache");

const admin = await headers("/admin");
assert([301, 302, 307, 308].includes(admin.status), `/admin redirects (${admin.status})`);
assert(/\/admin\/login/i.test(admin.headers.location || ""), "/admin → /admin/login");

const hop = await headers("/go/vitamin-d3-k2");
assert(hop.status === 200, `/go/vitamin-d3-k2 → ${hop.status} (magazine hop)`);
assert(/cloudflare/i.test(hop.headers.server || ""), "/go served by Cloudflare");

console.log(`\nLive host ${origin} is Cloudflare Workers.\n`);
