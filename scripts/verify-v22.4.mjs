#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const CS_RE = /[áčďéěíňóřšťúůýž]/i;

async function fetchMeta(path) {
  const t0 = performance.now();
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  const text = await r.text();
  return {
    status: r.status,
    text,
    cc: r.headers.get("cache-control"),
    ttfbMs: Math.round(performance.now() - t0),
  };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [home, studie, leky, legis, dh, novinky, nl, hry, login, admin] = await Promise.all([
    fetchMeta("/"),
    fetchMeta("/studie"),
    fetchMeta("/leky"),
    fetchMeta("/legislativa"),
    fetchMeta("/digital-health"),
    fetchMeta("/novinky"),
    fetchMeta("/newsletter"),
    fetchMeta("/medicina/hry"),
    fetchMeta("/login"),
    fetch(`${BASE}/admin/autopilot`, { redirect: "manual" }).then((r) => r.status),
  ]);

  const studieDetail = await fetchMeta("/studie/revmatoidni-artritida-rct-jak-inhibitory");
  const dhDetail = await fetchMeta("/digital-health/telemedicina-v-cesku");

  const checks = {
    uiVersion: health.uiVersion === "v22.4",
    homeStudie: home.text.includes('id="home-studie-heading"') && home.text.includes(">Studie<"),
    homeIcon: home.text.includes('aria-label="Domů'),
    noObory: !home.text.includes("Odborné obory"),
    lekyHub: leky.status === 200 && leky.text.includes("Léky a farmakoterapie"),
    legislativa: legis.status === 200 && CS_RE.test(legis.text),
    digitalHealth: dh.status === 200 && dh.text.includes("Monitorované zdroje"),
    novinky: novinky.status === 200 && CS_RE.test(novinky.text),
    newsletter: nl.status === 200 && nl.text.includes("Přihlásit k odběru"),
    hry: hry.status === 200 && (hry.text.includes("Kvízy a studijní hry") || hry.text.includes("Vzdělávací hry")),
    klinikaGame: hry.text.includes("klinicke-obory") || hry.text.includes("Klinické obory"),
    loginCz: login.text.includes("Přihlášení"),
    adminHidden: admin === 307 || admin === 302 || admin === 308,
    studieDetail: studieDetail.status === 200 && studieDetail.text.includes("Klinický dopad"),
    dhDetailCz: dhDetail.status === 200 && CS_RE.test(dhDetail.text),
    cacheOk: !home.cc?.includes("no-store"),
    homeTtfbOk: home.ttfbMs < 8000,
    homeCzech: CS_RE.test(home.text),
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({
    uiVersion: health.uiVersion,
    homeTtfbMs: home.ttfbMs,
    cacheControl: home.cc,
    ...checks,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
