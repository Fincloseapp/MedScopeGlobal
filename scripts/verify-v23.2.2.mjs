#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchPage(path) {
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  const text = await r.text();
  return { status: r.status, text };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [home, posledni, adminLogin] = await Promise.all([
    fetchPage("/"),
    fetchPage("/newsletter/posledni"),
    fetchPage("/admin/login"),
  ]);

  const checks = {
    uiVersion: health.uiVersion === "v23.2.2",
    logoInHeader: home.text.includes("/assets/logo/"),
    headerTaglineRemoved: !home.text.includes("text-[10px] uppercase tracking-[0.2em]"),
    newsletterLogo: posledni.text.includes("/assets/logo/"),
    adminLoginLogo: adminLogin.text.includes("/assets/logo/"),
    homeOk: home.status === 200,
    posledniOk: posledni.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
