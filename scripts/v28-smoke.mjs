/**
 * Public smoke checks for MedScope v28 surfaces (no secrets required).
 */
const BASE = process.env.SMOKE_BASE || "https://medscopeglobal.com";

const paths = [
  "/",
  "/predplatne",
  "/api/health",
  "/api/v28/health",
  "/api/v29/health",
  "/organizace",
  "/inzerce",
  "/kariera",
  "/kongresy",
  "/studijni-spoluprace",
];

async function check(path) {
  const url = `${BASE}${path}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, { redirect: "manual" });
    return {
      path,
      status: res.status,
      ms: Date.now() - t0,
      ok: res.status >= 200 && res.status < 400,
    };
  } catch (e) {
    return { path, status: 0, ms: Date.now() - t0, ok: false, error: String(e) };
  }
}

const results = [];
for (const p of paths) results.push(await check(p));

const health = await fetch(`${BASE}/api/v28/health`).then((r) => r.json());
console.log(JSON.stringify({ base: BASE, email: health.email, results }, null, 2));

const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
