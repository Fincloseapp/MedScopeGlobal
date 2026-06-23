import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = process.argv[2] ?? "768c36a01da05918e71dae3184ffd2b3b4274129";
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const res = await fetch(
  `https://api.vercel.com/v13/deployments?teamId=${env.VERCEL_ORG_ID}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "medscopeglobal",
      project: env.VERCEL_PROJECT_ID,
      target: "production",
      gitSource: {
        type: "github",
        repoId: 1249656741,
        ref: "main",
        sha,
      },
    }),
  }
);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
if (data.url) console.log(`DEPLOY_URL=https://${data.url}`);
