#!/usr/bin/env node
/**
 * HTTP smoke for global health ecosystem routes (locale, SEO, editorial API, apps).
 * Run: pnpm exec tsx scripts/ecosystem-smoke.ts
 * Requires dev server: MEDSCOPE_ORIGIN=http://localhost:3000
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const origin = (process.env.MEDSCOPE_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");

type SmokeCase = {
  path: string;
  label: string;
  expectStatus?: number | number[];
  allowRedirect?: boolean;
  expectBody?: RegExp;
  jsonField?: string;
};

const CASES: SmokeCase[] = [
  { path: "/", label: "root locale redirect", expectStatus: [302, 307, 308], allowRedirect: true },
  {
    path: "/cs",
    label: "Czech homepage magazine desks",
    expectStatus: 200,
    expectBody: /href="\/article\/|Zpravodajství|VitaScope/i,
  },
  { path: "/cs/", label: "Czech homepage trailing slash", expectStatus: [200, 308] },
  { path: "/en-us", label: "English homepage", expectStatus: 200 },
  { path: "/en-us/", label: "English homepage trailing slash", expectStatus: [200, 308] },
  {
    path: "/cs/articles",
    label: "Czech articles magazine with demo feed",
    expectStatus: 200,
    expectBody: /href="\/article\/[^"]+|VitaScope/i,
  },
  {
    path: "/cs/article/verejnost-zivotni-styl-zdravy-spanek",
    label: "Demo seed article detail",
    expectStatus: 200,
    expectBody: /spánek|VitaScope|Tringelt|Podpořit autora/i,
  },
  {
    path: "/cs/article/missing-slug-smoke-test",
    label: "Missing article slug soft 404",
    expectStatus: [404, 200],
  },
  { path: "/cs/vip/protokoly", label: "VIP protocols listing", expectStatus: 200, expectBody: /protokol/i },
  {
    path: "/cs/vip/protokoly/biohacking-zacatecnici",
    label: "VIP protocol detail",
    expectStatus: 200,
    expectBody: /MediFlow|Biohacking/i,
  },
  { path: "/app/mediflow", label: "MediFlow PWA shell", expectStatus: 200 },
  {
    path: "/app/pacient",
    label: "MeDipacient PWA shell",
    expectStatus: 200,
    expectBody: /Přehled|MeDipacient|Přihlášení/i,
  },
  {
    path: "/app/dokumentace",
    label: "OrdiZapis PWA shell",
    expectStatus: 200,
    expectBody: /OrdiZapis|Zápis|Přihlášení/i,
  },
  {
    path: "/go/magnesium",
    label: "Affiliate alias redirect",
    expectStatus: [302, 307],
    allowRedirect: true,
  },
  { path: "/robots.txt", label: "robots.txt", expectStatus: 200, expectBody: /Sitemap|User-agent/i },
  { path: "/sitemap-cs.xml", label: "Czech sitemap", expectStatus: 200, expectBody: /<urlset/i },
  {
    path: "/api/ecosystem/editorial/desks?locale=cs",
    label: "editorial desks API",
    expectStatus: 200,
    jsonField: "desk",
  },
];

function statusOk(actual: number, expected: number | number[] | undefined): boolean {
  if (!expected) return actual >= 200 && actual < 400;
  const allowed = Array.isArray(expected) ? expected : [expected];
  return allowed.includes(actual);
}

async function runCase(test: SmokeCase): Promise<{ ok: boolean; status: number; detail: string }> {
  const res = await fetch(`${origin}${test.path}`, { redirect: test.allowRedirect ? "manual" : "follow" });
  const status = res.status;
  let detail = "";

  if (!statusOk(status, test.expectStatus)) {
    return { ok: false, status, detail: `expected ${JSON.stringify(test.expectStatus ?? "2xx")}` };
  }

  if (test.expectBody || test.jsonField) {
    const text = await res.text();
    if (test.expectBody && !test.expectBody.test(text)) {
      return { ok: false, status, detail: `body missing ${test.expectBody}` };
    }
    if (test.jsonField) {
      try {
        const json = JSON.parse(text) as Record<string, unknown>;
        if (!(test.jsonField in json)) {
          return { ok: false, status, detail: `JSON missing field ${test.jsonField}` };
        }
      } catch {
        return { ok: false, status, detail: "invalid JSON" };
      }
    }
  }

  return { ok: true, status, detail: "ok" };
}

async function main(): Promise<void> {
  const lines: string[] = [`Ecosystem smoke @ ${origin}`, ""];
  let failed = 0;

  for (const test of CASES) {
    const result = await runCase(test);
    const mark = result.ok ? "✓" : "✗";
    const line = `${mark} ${test.label} (${test.path}) → ${result.status} ${result.detail}`;
    lines.push(line);
    console.log(line);
    if (!result.ok) failed += 1;
  }

  lines.push("");
  lines.push(failed === 0 ? "All checks passed" : `${failed} check(s) failed`);
  console.log("");

  try {
    mkdirSync("/opt/cursor/artifacts", { recursive: true });
    writeFileSync(join("/opt/cursor/artifacts", "ecosystem-smoke-output.log"), lines.join("\n"));
  } catch {
    // optional artifact dir
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
