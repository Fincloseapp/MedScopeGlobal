#!/usr/bin/env node
/**
 * PR #19 post-merge production smoke — ecosystem surfaces on medscopeglobal.com.
 * Run: pnpm smoke:production
 * Env: MEDSCOPE_ORIGIN (default https://medscopeglobal.com)
 */
const origin = (process.env.MEDSCOPE_ORIGIN || "https://medscopeglobal.com").replace(/\/$/, "");

/** @type {{ path: string; label: string; must?: RegExp; status?: number[] }} */
const CHECKS = [
  {
    path: "/cs",
    label: "Czech homepage (VitaScope)",
    must: /VitaScope/i,
    status: [200],
  },
  {
    path: "/en-us",
    label: "English homepage",
    must: /VitaScope|MediFlow|health/i,
    status: [200],
  },
  {
    path: "/mediflow",
    label: "MediFlow marketing",
    must: /MediFlow/i,
    status: [200],
  },
  {
    path: "/vip/protokoly",
    label: "VIP protocols listing",
    must: /protokol|Longevity|VIP/i,
    status: [200],
  },
  {
    path: "/robots.txt",
    label: "robots.txt",
    must: /Sitemap|User-agent/i,
    status: [200],
  },
  {
    path: "/sitemap-cs.xml",
    label: "Czech sitemap",
    must: /<urlset/i,
    status: [200],
  },
];

let failed = 0;

function fail(msg) {
  failed += 1;
  console.error(`FAIL ${msg}`);
}

function ok(msg) {
  console.log(`OK   ${msg}`);
}

for (const check of CHECKS) {
  const url = `${origin}${check.path}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    const allowed = check.status ?? [200];
    console.log(`${res.status} ${url}`);

    if (!allowed.includes(res.status)) {
      fail(`${check.label}: status ${res.status} (expected ${allowed.join("|")})`);
      continue;
    }

    if (check.must && !check.must.test(text)) {
      fail(`${check.label}: body missing ${check.must}`);
      continue;
    }

    ok(check.label);
  } catch (e) {
    fail(`${check.label}: ${e instanceof Error ? e.message : e}`);
  }
}

try {
  const healthUrl = `${origin}/api/health`;
  const res = await fetch(healthUrl, { signal: AbortSignal.timeout(15000) });
  const body = await res.json();
  console.log(`${res.status} ${healthUrl}`);
  if (!res.ok || body?.ok !== true) {
    fail("health endpoint must return ok:true");
  } else {
    ok(`health cloudflare=${body.cloudflare ?? false}`);
  }
} catch (e) {
  fail(`health: ${e instanceof Error ? e.message : e}`);
}

if (failed) {
  console.error(`\nsmoke:production failed: ${failed} check(s) @ ${origin}`);
  process.exit(1);
}

console.log(`\nsmoke:production ok @ ${origin}`);
