#!/usr/bin/env node
/**
 * Confirm medscopeglobal.com is served by Cloudflare Workers, not Vercel.
 *
 * Probe only cheap, non-SSR paths. HEAD on magazine HTML and affiliate
 * hops regularly sit past GitHub Actions' fetch timeout after a Worker
 * deploy (cold isolate or bot-challenge stall). Host identity is already
 * on /robots.txt in tens of milliseconds.
 */
const origin =
  process.env.LIVE_ORIGIN ?? process.env.MEDSCOPE_ORIGIN ?? "https://medscopeglobal.com";
const ua = "Mozilla/5.0 (compatible; MedScopeCloudflareAssert/1.0)";

async function request(path, { method = "GET" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(`${origin}${path}`, {
      method,
      redirect: "manual",
      headers: { "user-agent": ua, "accept-language": "cs" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function assertCloudflare(res, path) {
  const server = (res.headers.get("server") ?? "").toLowerCase();
  if (server.includes("vercel") || res.headers.get("x-vercel-id") || res.headers.get("x-vercel-cache")) {
    throw new Error(`${path} is still served by Vercel`);
  }
  if (!res.headers.get("cf-ray") && !server.includes("cloudflare")) {
    throw new Error(`${path} is missing Cloudflare identity (cf-ray / server)`);
  }
}

const robots = await request("/robots.txt");
if (!robots.ok) {
  throw new Error(`/robots.txt returned ${robots.status}`);
}
assertCloudflare(robots, "/robots.txt");

const admin = await request("/admin", { method: "HEAD" });
if (![301, 302, 307, 308].includes(admin.status)) {
  throw new Error(`/admin returned ${admin.status}, expected a login redirect`);
}
if (!/\/admin\/login/i.test(admin.headers.get("location") ?? "")) {
  throw new Error(`/admin location is ${admin.headers.get("location")}`);
}
assertCloudflare(admin, "/admin");

console.log(
  JSON.stringify(
    {
      origin,
      robots: robots.status,
      admin: admin.status,
      adminLocation: admin.headers.get("location"),
      server: robots.headers.get("server"),
      cfRay: robots.headers.get("cf-ray"),
    },
    null,
    2,
  ),
);
