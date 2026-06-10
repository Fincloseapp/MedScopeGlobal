import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { loadUniversitiesReport } from "@/lib/v25/universities";

export async function runUniversitiesFetch() {
  if (process.env.VERCEL === "1") {
    const faculties = [
      { slug: "lf-uk-1", url: "https://www.lf1.cuni.cz" },
      { slug: "lf-mu", url: "https://www.med.muni.cz" },
    ];
    let ok = 0;
    for (const f of faculties) {
      try {
        const res = await fetch(f.url, { signal: AbortSignal.timeout(15000) });
        if (res.ok) ok += 1;
      } catch {
        /* */
      }
    }
    return { ok: ok > 0, fetched: faculties.length, detail: "vercel-lite" };
  }

  const script = join(process.cwd(), "lib/v25/providers/universities-provider.mjs");
  const result = spawnSync(process.execPath, [script], { encoding: "utf8", timeout: 180000 });
  const report = loadUniversitiesReport();
  return {
    ok: result.status === 0,
    fetched: report?.totals.fetched ?? 0,
    detail: report ? `${report.totals.ok}/${report.totals.fetched} OK` : undefined,
  };
}
