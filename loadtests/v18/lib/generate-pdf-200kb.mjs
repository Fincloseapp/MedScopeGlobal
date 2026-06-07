import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const fixture = join(root, "tests/v18/fixtures/sample.pdf");

/** Build ~200 KiB PDF buffer for upload load tests. */
export function generatePdf200Kb(targetBytes = 200 * 1024) {
  let base;
  if (existsSync(fixture)) {
    base = readFileSync(fixture);
  } else {
    base = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n",
      "utf8"
    );
  }

  const padding = Buffer.alloc(Math.max(0, targetBytes - base.length - 64), 0x20);
  const comment = Buffer.from(
    `\n%PAD${Date.now()}\n%${"X".repeat(Math.max(0, padding.length - 32))}\n`,
    "utf8"
  );
  const buf = Buffer.concat([base, comment]);
  if (buf.length < targetBytes) {
    return Buffer.concat([buf, Buffer.alloc(targetBytes - buf.length, 0x20)]);
  }
  return buf.subarray(0, targetBytes);
}
