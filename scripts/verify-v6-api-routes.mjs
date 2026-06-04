/**
 * Ensures V6 API route files exist before deploy (pre-push check).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const routes = ["pubmed", "regulatory", "autopublish", "trends", "guidelines"];
let ok = true;

for (const name of routes) {
  const p = path.join(root, "app", "api", "v6", name, "route.ts");
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
    continue;
  }
  const src = fs.readFileSync(p, "utf8");
  if (!src.includes("export async function POST")) {
    console.error("No POST export:", p);
    ok = false;
  } else {
    console.log("OK", path.relative(root, p));
  }
}

process.exit(ok ? 0 : 1);
