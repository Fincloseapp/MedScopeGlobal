/**
 * Seeds medical categories + runs article ingestion.
 */
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const MEDICAL = [
  ["general-practice", "Všeobecné lékařství"],
  ["internal-medicine", "Interna"],
  ["cardiology", "Kardiologie"],
  ["endocrinology", "Endokrinologie / Diabetologie"],
  ["rheumatology", "Revmatologie"],
  ["oncology", "Onkologie"],
  ["neurology", "Neurologie"],
  ["pulmonology", "Pneumologie"],
  ["dermatology", "Dermatologie"],
  ["gastroenterology", "Gastroenterologie"],
  ["infectious-disease", "Infekční medicína"],
  ["psychiatry", "Psychiatrie"],
  ["allergy-immunology", "Alergologie / Imunologie"],
  ["orthopedics", "Ortopedie"],
  ["surgery", "Chirurgie"],
  ["pediatrics", "Pediatrie"],
  ["emergency-medicine", "Urgentní medicína"],
  ["medical-education", "Studium medicíny"],
  ["residents", "Mladí lékaři / rezidenti"],
  ["ophthalmology", "Oční lékařství"],
  ["glaucoma", "Glaukom"],
  ["cataract", "Katarakta"],
  ["macular-degeneration", "Makulární degenerace"],
  ["diabetic-retinopathy", "Diabetická retinopatie"],
  ["refractive-disorders", "Refrakční vady"],
  ["ocular-surgery", "Oční chirurgie"],
  ["ocular-pharmacology", "Oční farmakologie"],
];

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("Seeding medical categories...");
const { error: catErr } = await admin.from("categories").upsert(
  MEDICAL.map(([slug, name]) => ({ slug, name })),
  { onConflict: "slug" }
);
if (catErr) {
  console.error("Category seed failed:", catErr.message);
  process.exit(1);
}
console.log(`✓ ${MEDICAL.length} categories`);

console.log("Running article ingestion (2–5 min)...");
await new Promise((resolve, reject) => {
  const child = spawn(
    "npx",
    ["tsx", path.join(root, "scripts", "run-ingestion.ts")],
    { cwd: root, stdio: "inherit", shell: true }
  );
  child.on("exit", (code) =>
    code === 0 ? resolve() : reject(new Error(`ingest exit ${code}`))
  );
});

console.log("\nDone. Run: npm run dev");
