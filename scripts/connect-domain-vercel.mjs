#!/usr/bin/env node
/**
 * Connect medscopeglobal.com (+ www) to Vercel production project.
 * Uses VERCEL_TOKEN from .env.local; optional Cloudflare DNS via CLOUDFLARE_API_TOKEN.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const k = m[1].trim();
      let v = m[2].trim().replace(/^["']|["']$/g, "");
      if (!env[k]) env[k] = v;
    }
  }
  return env;
}

const env = loadEnv();
const token = env.VERCEL_TOKEN;
const projectId = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";
const apex = env.VERCEL_PRODUCTION_DOMAIN || "medscopeglobal.com";
const www = `www.${apex}`;
const cfToken = env.CLOUDFLARE_API_TOKEN;
const zoneName = env.CLOUDFLARE_ZONE_NAME || apex;

if (!token) {
  console.error("✗ VERCEL_TOKEN missing in .env.local");
  process.exit(1);
}

async function vercel(path, { method = "GET", body } = {}) {
  let url = `https://api.vercel.com${path}`;
  const sep = path.includes("?") ? "&" : "?";
  if (teamId && !path.includes("teamId=")) url += `${sep}teamId=${encodeURIComponent(teamId)}`;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data, text };
}

async function addProjectDomain(name) {
  const r = await vercel(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: { name },
  });
  if (r.ok || r.status === 409) return r.data;
  throw new Error(`add domain ${name}: ${r.text?.slice(0, 300)}`);
}

async function getProjectDomain(name) {
  const r = await vercel(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`);
  if (r.ok) return r.data;
  return null;
}

async function verifyProjectDomain(name) {
  return vercel(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}/verify`, {
    method: "POST",
  });
}

async function getDomainConfig(name) {
  const r = await vercel(`/v6/domains/${encodeURIComponent(name)}/config`);
  return r.ok ? r.data : null;
}

async function listProjectDomains() {
  const r = await vercel(`/v9/projects/${projectId}/domains`);
  return r.ok ? (r.data.domains ?? r.data) : [];
}

async function getLatestProductionDeployment() {
  const qs = `projectId=${projectId}&target=production&limit=1`;
  const r = await vercel(`/v6/deployments?${qs}`);
  return r.data?.deployments?.[0] ?? null;
}

async function assignAlias(deploymentId, alias) {
  return vercel(`/v2/deployments/${deploymentId}/aliases`, {
    method: "POST",
    body: { alias },
  });
}

function buildDnsTable(domainRecords) {
  const rows = [];
  for (const d of domainRecords) {
    const verification = d.verification ?? [];
    for (const v of verification) {
      rows.push({
        type: v.type,
        name: v.domain?.replace(`.${apex}`, "") || v.domain || "@",
        value: v.value,
        ttl: 3600,
        purpose: "verification",
      });
    }
  }
  // Vercel recommended production records
  rows.push({
    type: "A",
    name: "@",
    value: "76.76.21.21",
    ttl: 3600,
    purpose: "apex",
  });
  rows.push({
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 3600,
    purpose: "www",
  });
  return dedupeDns(rows);
}

function dedupeDns(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    const k = `${r.type}|${r.name}|${r.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

async function detectDnsProvider() {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${apex}&type=NS`, {
      headers: { Accept: "application/dns-json" },
    });
    const json = await res.json();
    const ns = (json.Answer ?? []).map((a) => a.data.toLowerCase());
    if (ns.some((n) => n.includes("cloudflare"))) return { provider: "Cloudflare", ns };
    if (ns.some((n) => n.includes("wedos"))) return { provider: "Wedos", ns };
    if (ns.length) return { provider: "other", ns };
  } catch {
    /* ignore */
  }
  return { provider: "unknown", ns: [] };
}

async function applyCloudflareDns(dnsRows) {
  if (!cfToken) return { applied: false, reason: "no CLOUDFLARE_API_TOKEN" };

  const headers = {
    Authorization: `Bearer ${cfToken}`,
    "Content-Type": "application/json",
  };
  async function cf(path, init = {}) {
    const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
    });
    const json = await res.json();
    if (!json.success) throw new Error(JSON.stringify(json.errors ?? json).slice(0, 400));
    return json.result;
  }

  let zoneId = env.CLOUDFLARE_ZONE_ID;
  if (!zoneId) {
    const zones = await cf(`/zones?name=${zoneName}`);
    zoneId = zones?.[0]?.id;
  }
  if (!zoneId) return { applied: false, reason: "zone not found" };

  const existing = await cf(`/zones/${zoneId}/dns_records?per_page=100`);
  const applied = [];

  for (const rec of dnsRows.filter((r) => r.purpose !== "verification")) {
    const cfName = rec.name === "@" ? zoneName : `${rec.name}.${zoneName}`;
    const match = existing.find((r) => r.type === rec.type && r.name === cfName);
    const body =
      rec.type === "CNAME"
        ? { type: "CNAME", name: rec.name, content: rec.value, ttl: 1, proxied: false }
        : { type: "A", name: rec.name, content: rec.value, ttl: 1, proxied: false };

    if (match) {
      await cf(`/zones/${zoneId}/dns_records/${match.id}`, { method: "PUT", body: JSON.stringify(body) });
      applied.push(`updated ${rec.type} ${rec.name}`);
    } else {
      await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(body) });
      applied.push(`created ${rec.type} ${rec.name}`);
    }
  }

  // TXT verification records
  for (const rec of dnsRows.filter((r) => r.purpose === "verification" && r.type === "TXT")) {
    const cfName = rec.name === "@" ? zoneName : `${rec.name}.${zoneName}`.replace(`..`, `.`);
    const fullName = rec.name.startsWith("_vercel") ? `${rec.name}.${zoneName}` : cfName;
    const match = existing.find((r) => r.type === "TXT" && r.name === fullName);
    const body = { type: "TXT", name: rec.name.startsWith("_vercel") ? rec.name : rec.name, content: rec.value, ttl: 1 };
    if (!match) {
      await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(body) });
      applied.push(`created TXT ${rec.name}`);
    }
  }

  return { applied: true, zoneId, changes: applied };
}

async function waitForVerification(names, maxMin = 10) {
  const deadline = Date.now() + maxMin * 60_000;
  while (Date.now() < deadline) {
    let allVerified = true;
    for (const name of names) {
      const d = await getProjectDomain(name);
      const verified = d?.verified === true || d?.verification?.every?.((v) => v.verified);
      if (!verified && d?.verified !== true) {
        allVerified = false;
        await verifyProjectDomain(name);
      }
    }
    if (allVerified) return true;
    await new Promise((r) => setTimeout(r, 30_000));
  }
  return false;
}

async function testUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
    return { url, status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (e) {
    return { url, status: 0, ok: false, error: e.message };
  }
}

const report = {
  domains: [],
  dns: [],
  provider: null,
  cloudflare: null,
  verification: {},
  alias: null,
  availability: [],
};

console.log("\n=== Vercel domain connect ===\n");

for (const name of [apex, www]) {
  try {
    const added = await addProjectDomain(name);
    console.log(`✓ Domain added/linked: ${name}`);
    report.domains.push({ name, added: true, data: added });
  } catch (e) {
    console.log(`• Domain ${name}: ${e.message}`);
    report.domains.push({ name, error: e.message });
  }
}

const projectDomains = await listProjectDomains();
for (const d of projectDomains) {
  if (d.name === apex || d.name === www) {
    report.domains.push({ name: d.name, verified: d.verified, verification: d.verification });
  }
}

report.dns = buildDnsTable(
  projectDomains.filter((d) => d.name === apex || d.name === www)
);

report.provider = await detectDnsProvider();
console.log(`DNS provider: ${report.provider.provider}`, report.provider.ns?.join(", ") ?? "");

if (report.provider.provider === "Cloudflare" && cfToken) {
  report.cloudflare = await applyCloudflareDns(report.dns);
  console.log("Cloudflare:", report.cloudflare);
}

console.log("\nWaiting for DNS verification (up to 10 min)...");
const verified = await waitForVerification([apex, www], 10);
report.verification = { verified, apex: await getProjectDomain(apex), www: await getProjectDomain(www) };

const deployment = await getLatestProductionDeployment();
if (deployment?.uid) {
  for (const alias of [apex, www]) {
    const ar = await assignAlias(deployment.uid, alias);
    console.log(`Alias ${alias}:`, ar.ok ? "OK" : ar.status);
  }
  report.alias = { deploymentId: deployment.uid, aliases: [apex, www] };
}

for (const url of [
  `https://${apex}`,
  `https://${www}`,
  `https://${www}/odborne/briefy`,
]) {
  const t = await testUrl(url);
  report.availability.push(t);
  console.log(`${t.ok ? "✓" : "✗"} ${url} → ${t.status}`);
}

const outPath = join(root, "scripts", "domain-connect-report.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`\nReport: ${outPath}`);

const allOk = report.availability.every((a) => a.ok);
process.exit(allOk ? 0 : 1);
