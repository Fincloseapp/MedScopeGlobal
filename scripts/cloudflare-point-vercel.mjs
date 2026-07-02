/**
 * Points medscopeglobal.com DNS to Vercel (Cloudflare API).
 * .env.local: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID (optional — auto lookup)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const token = env.CLOUDFLARE_API_TOKEN;
const zoneName = env.CLOUDFLARE_ZONE_NAME || "medscopeglobal.com";
let zoneId = env.CLOUDFLARE_ZONE_ID;

if (!token) {
  console.log(`
Chybí CLOUDFLARE_API_TOKEN v .env.local

Cloudflare → My Profile → API Tokens → Create Token
  Template: Edit zone DNS
  Zone: medscopeglobal.com

Pak:
  CLOUDFLARE_API_TOKEN=...
  npm run dns:cloudflare
`);
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(JSON.stringify(json.errors ?? json).slice(0, 400));
  }
  return json.result;
}

if (!zoneId) {
  const zones = await cf(`/zones?name=${zoneName}`);
  zoneId = zones?.[0]?.id;
  if (!zoneId) throw new Error(`Zone not found: ${zoneName}`);
  console.log(`Zone ID: ${zoneId}`);
}

const records = [
  { type: "A", name: "@", content: "76.76.21.21", proxied: false, ttl: 1 },
  { type: "A", name: "www", content: "76.76.21.21", proxied: false, ttl: 1 },
];

const existing = await cf(`/zones/${zoneId}/dns_records?per_page=100`);

for (const rec of records) {
  const match = existing.find(
    (r) => r.type === rec.type && r.name === (rec.name === "@" ? zoneName : `${rec.name}.${zoneName}`)
  );
  if (match) {
    await cf(`/zones/${zoneId}/dns_records/${match.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...rec, name: rec.name }),
    });
    console.log(`✓ Updated ${rec.type} ${rec.name}`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(rec),
    });
    console.log(`✓ Created ${rec.type} ${rec.name}`);
  }
}

console.log("\nDNS nastaveno. Ověření může trvat 5–15 minut.");
console.log("https://medscopeglobal.com");
