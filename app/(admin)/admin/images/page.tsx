import type { Metadata } from "next";
import { loadImageFixLogLocal, loadImageReportAsync } from "@/lib/v25/images/persist";
import type { V25ImageRegistryEntry } from "@/lib/v25/types";
import { ImageFixLog } from "./components/ImageFixLog";
import { ImageHistory } from "./components/ImageHistory";
import { ImageCenterClient } from "./components/ImageCenterClient";
import { RunImageBackfillButton } from "./components/RunImageBackfillButton";

export const metadata: Metadata = {
  title: "Image Center — Admin",
  description: "AI Image Selector + Generator — správa obrázků MedScopeGlobal",
};

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  const report = await loadImageReportAsync();
  const fixLog = loadImageFixLogLocal();
  const images: V25ImageRegistryEntry[] = report?.images ?? [];

  const stats = {
    total: images.length,
    generated: report?.generated ?? 0,
    assigned: report?.assigned ?? 0,
    failed: report?.failed ?? 0,
    missingBefore: report?.missingBefore ?? 0,
    lastRun: report?.at ?? null,
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">v25.1</p>
          <h1 className="font-display text-3xl font-bold text-[#021d33]">AI Image Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Dynamické přiřazování obrázků — selector, generator, style filter. Neutrální evropský profesionální
            styl bez stereotypizace.
          </p>
        </div>
        <RunImageBackfillButton />
      </div>

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
        </p>
      ) : null}

      <ImageCenterClient images={images} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageHistory images={images} />
        <ImageFixLog entries={fixLog} />
      </div>
    </div>
  );
}
