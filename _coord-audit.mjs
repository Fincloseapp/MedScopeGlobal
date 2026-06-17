import fs from "fs";

const BASE = "https://medscopeglobal.com";
const env = {};
try {
  for (const line of fs.readFileSync("D:/medscope.local/.env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {}

async function main() {
  console.log("=== GITHUB ===");
  const gh = await fetch("https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits?per_page=3", {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "medscope" },
  }).then((r) => r.json());
  console.log("MAIN", gh[0]?.sha?.slice(0, 7), gh[0]?.sha);

  console.log("\n=== VERCEL ===");
  const token = env.VERCEL_TOKEN;
  const pid = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
  const team = env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
  if (token) {
    const vj = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${pid}&teamId=${team}&limit=5&target=production`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then((r) => r.json());
    for (const d of vj.deployments || []) {
      console.log(d.readyState, d.meta?.githubCommitSha?.slice(0, 7), d.meta?.githubCommitMessage?.split("\n")[0]?.slice(0, 70));
    }
  } else console.log("no VERCEL_TOKEN");

  console.log("\n=== LF OU + Stripe ===");
  for (const u of ["/studium/prijimacky", "/studium/univerzity", "/studium/univerzity/lf-os"]) {
    const r = await fetch(BASE + u, { headers: { "User-Agent": "medscope-audit/1.0" } });
    const h = await r.text();
    console.log(u, r.status, "lf.osu.cz", h.includes("lf.osu.cz"));
  }
  const c = await fetch(BASE + "/api/v27/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "subscription", productId: "student-monthly" }),
  });
  console.log("checkout", c.status);
  const w = await fetch(BASE + "/api/stripe/webhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  console.log("webhook", w.status, (await w.text()).slice(0, 120));

  const m = await fetch(BASE + "/api/academy/marketplace");
  const mj = await m.json();
  console.log("marketplace listings", mj.listings?.length ?? "?", mj.listings?.[0]?.price_czk);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
