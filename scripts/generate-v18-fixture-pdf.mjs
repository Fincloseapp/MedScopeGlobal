#!/usr/bin/env node
/** Download a minimal valid PDF for v18 upload tests. */
import { writeFileSync } from "node:fs";
import { projectPath } from "../lib/config/paths.mjs";

const out = projectPath("tests/v18/fixtures/sample.pdf");
const url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const res = await fetch(url);
if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
writeFileSync(out, buf);
console.log(`✓ Wrote ${out} (${buf.length} bytes)`);
