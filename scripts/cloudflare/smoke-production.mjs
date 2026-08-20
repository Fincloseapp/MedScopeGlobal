#!/usr/bin/env node
const base = process.env.SMOKE_BASE_URL || "https://medscopeglobal.com";
const paths = ["/", "/aplikace", "/medipacient", "/mediprep", "/app/pacient", "/app/priprava", "/lekari/dokumentace", "/app/dokumentace", "/dashboard", "/predplatne"];
let failed = 0;
for (const p of paths) {
  const url = base.replace(/\/$/, "") + p;
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000) });
    console.log(`${res.status} ${url}`);
    if (res.status >= 500 || res.status === 402) failed += 1;
  } catch (e) {
    console.error(`ERR ${url}: ${e instanceof Error ? e.message : e}`);
    failed += 1;
  }
}
if (failed) process.exit(1);
console.log("smoke ok");