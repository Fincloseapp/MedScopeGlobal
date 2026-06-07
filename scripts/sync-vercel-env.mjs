/**
 * Pushes .env.local vars to Vercel (production + preview + development).
 */
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { VERCEL_SYNC_KEYS } from "./env-keys.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const keys = VERCEL_SYNC_KEYS;

const targets = ["production"];

function addEnv(name, value, target) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      ["vercel", "env", "add", name, target, "--force"],
      {
        cwd: root,
        shell: true,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );
    let err = "";
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${name}@${target}: ${err || `exit ${code}`}`));
    });
    child.stdin.write(value);
    child.stdin.end();
  });
}

console.log("Syncing env to Vercel...\n");
for (const key of keys) {
  const value = env[key];
  if (!value) {
    console.log(`○ skip ${key} (empty)`);
    continue;
  }
  for (const target of targets) {
    process.stdout.write(`→ ${key} [${target}] ... `);
    try {
      await addEnv(key, value, target);
      console.log("OK");
    } catch (e) {
      console.log("FAIL");
      console.error(e.message);
    }
  }
}
console.log("\nDone.");
