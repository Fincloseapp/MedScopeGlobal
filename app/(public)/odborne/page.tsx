import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getMedicalAiTexts, getStudySources } from "@/lib/queries/v4d/medical-ai";
import { SPECIALTY_LABELS_CS } from "@/lib/v4d/constants";
import type { V4dSpecialty } from "@/lib/v4d/constants";

export const metadata: Metadata = {
  title: "Odborné AI texty",
  description:
    "Automatické odborné texty z univerzit CZ/SK/EU/svět — filtrace oborů, kvalita, překlady do češtiny.",
};

export default async function OdbornePage() {
  const [texts, sources] = await Promise.all([
    getMedicalAiTexts({ limit: 12 }),
    getStudySources(),
  ]);

  const byRegion = {
    cz: sources.filter((s) => s.region === "cz"),
    sk: sources.filter((s) => s.region === "sk"),
    eu: sources.filter((s) => s.region === "eu"),
    world: sources.filter((s) => s.region === "world"),
  };

  return (
    <ModulePageShell
      eyebrow="V4d · Odborné texty"
      title="Odborné AI texty"
      description="V5+: Groq AI, automatické citace (Vancouver/APA/Harvard), DOI, PubMed/FDA/EMA/SÚKL, evidence scoring A–D."
      ctaHref="/odborne/ai"
      ctaLabel="AI asistent"
    >
      <div className="flex flex-wrap gap-2 text-sm mb-6">
        <Link
          href="/odborne/nejnovejsi"
          className="rounded-full bg-[#005B96] px-3 py-1 text-white"
        >
          Nejnovější
        </Link>
        <Link
          href="/odborne/kategorie"
          className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]"
        >
          Kategorie
        </Link>
        <Link href="/odborne/citace" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Citace
        </Link>
        <Link href="/odborne/zdroje" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Zdroje
        </Link>
        <Link href="/odborne/doi" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          DOI
        </Link>
        <Link href="/odborne/pubmed" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          PubMed
        </Link>
        <Link href="/odborne/evidence" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Evidence
        </Link>
        <Link href="/dashboard" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          V6 Dashboard
        </Link>
        <Link href="/autopilot" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          Autopilot
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {texts.map((t) => (
          <V4cContentCard
            key={t.id}
            href={`/odborne/${t.id}`}
            title={t.title}
            meta={[
              t.specialty
                ? SPECIALTY_LABELS_CS[t.specialty as V4dSpecialty] ?? t.specialty
                : null,
              t.source_name,
              t.quality_passed ? "✓ kvalita" : "review",
            ]
              .filter(Boolean)
              .join(" · ")}
            summary={t.summary_clinician}
            badge={t.original_language?.toUpperCase() ?? "CS"}
          />
        ))}
      </div>
      {texts.length === 0 ? (
        <p className="text-sm text-slate-600">
          Zatím žádné texty — spusťte cron <code>medical-ai-fetch</code> nebo počkejte na denní běh (9:00 UTC).
        </p>
      ) : null}
      <div className="mt-10 rounded-xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-4 text-xs text-slate-600 space-y-3">
        <p className="font-semibold text-[#021d33]">Monitorované instituce</p>
        <p>
          <strong>ČR:</strong> {byRegion.cz.map((s) => s.name).join(", ")}
        </p>
        <p>
          <strong>SK:</strong> {byRegion.sk.map((s) => s.name).join(", ")}
        </p>
        <p>
          <strong>EU:</strong> {byRegion.eu.map((s) => s.name).join(", ")}
        </p>
        <p>
          <strong>Svět:</strong> {byRegion.world.map((s) => s.name).join(", ")}
        </p>
      </div>
    </ModulePageShell>
  );
}
