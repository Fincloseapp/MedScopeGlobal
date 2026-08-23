import fs from "node:fs";
import path from "node:path";

const dir = path.join("lib", "lekari", "dokumentace", "fonts");
for (const f of ["mediktor-serif.ttf", "mediktor-serif-bold.ttf"]) {
  const b64 = fs.readFileSync(path.join(dir, f)).toString("base64");
  const out = path.join(dir, f.replace(".ttf", ".b64.ts"));
  const body =
    "// Auto-generated DejaVu Serif Latin/Latin-Ext subset for MeDiktor PDF Unicode.\n" +
    `export default ${JSON.stringify(b64)};\n`;
  fs.writeFileSync(out, body);
  console.log(out, "chars", b64.length);
}
