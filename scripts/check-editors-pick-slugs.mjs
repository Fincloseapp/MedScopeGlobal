import fs from "fs";

/** @type {Record<string, string>} */
const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const slugs = [
  "kardiologie-nemoci-srdce-a-cv",
  "neurologie-shrnut",
  "endokrinologie-zkladn-onemocnn-a-diagnostika",
  "diagnostika-revmatologickch-onemocnn-klov-kroky",
  "prevence-nemoc",
];

const filter = slugs.map((s) => `"${s}"`).join(",");
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/articles?select=slug,vip_only,published&slug=in.(${filter})`;

const res = await fetch(url, {
  headers: {
    apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  },
});

const data = await res.json();
console.log(JSON.stringify({ status: res.status, articles: data }, null, 2));

const found = new Set(Array.isArray(data) ? data.map((a) => a.slug) : []);
const missing = slugs.filter((s) => !found.has(s));
if (missing.length) {
  console.log("MISSING_SLUGS:", missing.join(", "));
  process.exitCode = 1;
}
