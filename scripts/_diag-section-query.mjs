/** One-off diagnostic — metadata.section query variants */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const section = "aktuální-zprávy";

const variants = [
  ["eq metadata->>section", () => admin.from("articles").select("id,slug,title,published,metadata").eq("published", true).eq("metadata->>section", section).limit(10)],
  ["filter metadata->>section", () => admin.from("articles").select("id,slug,title,published,metadata").eq("published", true).filter("metadata->>section", "eq", section).limit(10)],
  ["contains metadata", () => admin.from("articles").select("id,slug,title,published,metadata").eq("published", true).contains("metadata", { section }).limit(10)],
  ["all with section key", () => admin.from("articles").select("id,slug,title,published,metadata").eq("published", true).not("metadata->section", "is", null).limit(20)],
];

for (const [label, fn] of variants) {
  const { data, error } = await fn();
  console.log(`\n=== ${label} ===`);
  if (error) console.log("ERROR:", error.message);
  else console.log("count:", data?.length, data?.map((a) => ({ slug: a.slug, section: a.metadata?.section })));
}
