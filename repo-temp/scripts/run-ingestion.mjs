/**
 * Runs ingestion directly (no dev server required).
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const child = spawn(
  "npx",
  [
    "tsx",
    path.join(root, "scripts", "run-ingestion.ts"),
  ],
  { cwd: root, stdio: "inherit", shell: true }
);

child.on("exit", (code) => process.exit(code ?? 1));
