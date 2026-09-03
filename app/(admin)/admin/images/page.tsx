import type { Metadata } from "next";
import { loadImageFixLogLocal, loadImageReportAsync } from "@/lib/v25/images/persist";
import type { V25ImageRegistryEntry } from "@/lib/v25/types";
import { ImageFixLog } from "./components/ImageFixLog";
import { ImageHistory } from "./components/ImageHistory";
import { ImageCenterClient } from "./components/ImageCenterClient";
import { RunImageBackfillButton } from "./components/RunImageBackfillButton";
import { EditorialPulseStrip } from "@/components/admin/editorial-pulse-strip";
import { loadEditorialPulse } from "@/lib/admin/editorial-pulse";

export const metadata: Metadata = {
  title: "Image Center — Admin",
  description: "AI Image Selector + Generator — správa obrázků MedScopeGlobal",
};

export const dynamic = "force-dynamic";

function aggregateFailureReasons(
  entries: Array<{ result?: string; detail?: string; action?: string }>
): Array<{ reason: string; count: number }> {
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (e.result !== "fail") continue;
    const raw = (e.detail || e.action || "neznámá chyba").trim();
    const reason = raw.length > 80 ? `${raw.slice(0, 77)}…` : raw;
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export default async function AdminImagesPage() {
  const [report, pulse] = await Promise.all([loadImageReportAsync(), loadEditorialPulse()]);
  const localFixLog = loadImageFixLogLocal();
  const fixLog = (report?.fixLog?.length ? report.fixLog : localFixLog) ?? [];
  const images: V25ImageRegistryEntry[] = report?.images ?? [];

  const stats = {
    total: images.length || report?.total || 0,
    generated: report?.generated ?? 0,
    assigned: report?.assigned ?? 0,
    failed: report?.failed ?? 0,
    missingBefore: report?.missingBefore ?? 0,
    lastRun: report?.at ?? null,
  };

  const failureReasons = aggregateFailureReasons(fixLog);
  const pipelineBroken = stats.failed > 0 && stats.assigned === 0 && stats.total === 0;
  const pipelinePartial = stats.failed > 0 && stats.assigned > 0;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Image pipeline</p>
          <h1 className="font-display text-3xl font-bold text-[#021d33]">AI Image Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Živý stav coverů z databáze (ne jen starý souborový report). Registry níže může být
            z posledního pipeline běhu.
          </p>
        </div>
        <RunImageBackfillButton />
      </div>

      <EditorialPulseStrip pulse={pulse} />

      {pipelineBroken ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Poslední běh nepřiřadil žádný obrázek</p>
          <p className="mt-1 text-amber-900/90">
            Detekováno {stats.missingBefore} chybějících coverů, selhalo {stats.failed}. Spusťte znovu
            „Automatické doplnění“ — po opravě style filtru by měla projít SVG / curated cesta.
          </p>
          {failureReasons.length ? (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-900/80">
              {failureReasons.map((r) => (
                <li key={r.reason}>
                  {r.reason} ({r.count}×)
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {pipelinePartial ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          Částečný úspěch: přiřazeno {stats.assigned}, selhalo {stats.failed}. Detaily jsou v logu oprav.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Celkem v registru", value: stats.total },
          { label: "Vygenerováno", value: stats.generated },
          { label: "Přiřazeno", value: stats.assigned },
          { label: "Chybějící (posl. běh)", value: stats.missingBefore },
          { label: "Selhalo", value: stats.failed },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#021d33]">{s.value}</p>
          </div>
        ))}
      </div>

      {stats.lastRun ? (
        <p className="text-xs text-muted-foreground">
          Poslední běh pipeline: {new Date(stats.lastRun).toLocaleString("cs-CZ")}
          {stats.missingBefore > 0
            ? ` · zbývá doplnit až ${Math.max(0, stats.missingBefore - stats.assigned)} položek`
            : null}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Pipeline ještě neběžela — spusťte automatické doplnění.</p>
      )}

      <ImageCenterClient images={images} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageHistory images={images} />
        <ImageFixLog entries={fixLog} />
      </div>
    </div>
  );
}
