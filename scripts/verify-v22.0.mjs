#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const header = home;
  const nl = await fetch(`${BASE}/newsletter?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const hry = await fetch(`${BASE}/medicina/hry?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const quiz = await fetch(`${BASE}/medicina/hry/anatomie-systemy?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const studie = await fetch(`${BASE}/studie?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const autopilot = await fetch(`${BASE}/autopilot`, { redirect: "manual" });
  const leky = await fetch(`${BASE}/leky/novinky?_${Date.now()}`, { cache: "no-store" }).then((r) => r.status);

  const ok =
    health.uiVersion === "v22.0" &&
    (header.includes('aria-label="Domů"') || header.includes("Domů")) &&
    nl.includes("Přihlásit k odběru") &&
    nl.includes("medicínský newsletter") &&
    hry.includes("Kvízy a studijní hry") &&
    quiz.includes("Otázka") &&
    studie.includes("v20-study-card") &&
    (autopilot.status === 307 || autopilot.status === 308) &&
    leky === 200;

  console.log({
    uiVersion: health.uiVersion,
    homeIcon: header.includes('aria-label="Domů"'),
    newsletter: nl.includes("Přihlásit"),
    hry: hry.includes("anatomie"),
    quiz: quiz.includes("Otázka"),
    autopilotRedirect: autopilot.status,
    leky,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
