import type { DigitalHealthRow } from "@/lib/queries/v4c/digital-health";
import { ensureCzechText, formatCsDate } from "@/lib/v21/enrich";
import { v21ImageForModule } from "@/lib/v21/images";
import { V22_DIGITAL_HEALTH_SOURCES } from "@/lib/v22/digital-health/sources";
import type { V22DigitalHealthArticle } from "@/lib/v22/digital-health/types";

export function enrichDigitalHealthRow(row: DigitalHealthRow): V22DigitalHealthArticle {
  const meta = (row as DigitalHealthRow & { ai_metadata?: Record<string, unknown> }).ai_metadata ?? {};
  const title = ensureCzechText(row.title, "Digitální zdravotnictví");
  const summary = ensureCzechText(
    row.summary,
    `${title} — odborný přehled digitálního zdravotnictví pro českou klinickou praxi.`
  );
  const body = ensureCzechText(
    row.body,
    "Podrobná analýza vychází z monitorovaných zdrojů MZČR, eZdraví, WHO, EMA a dalších odborných portálů."
  );

  const tierSources = V22_DIGITAL_HEALTH_SOURCES.slice(0, 4).map((s) => ({
    name: s.name,
    url: s.url,
    tier: s.tier,
  }));

  if (row.source_url) {
    tierSources.unshift({ name: "Primární zdroj", url: row.source_url, tier: "cz" as const });
  }

  return {
    id: row.id,
    slug: row.slug,
    title,
    topic: (meta.topic as string) ?? row.topic ?? "eHealth",
    summaryCs: summary,
    whatIsCs: (meta.whatIsCs as string) ?? body.slice(0, 500),
    trendsCs:
      (meta.trendsCs as string) ??
      "Digitalizace zdravotnictví akceleruje adopci telemedicíny, AI a interoperabilních systémů v souladu s evropskými standardy.",
    risksCs:
      (meta.risksCs as string) ??
      "Klíčová rizika: ochrana dat, kybernetická bezpečnost, regulační compliance a kvalita klinické dokumentace.",
    legislationCs:
      (meta.legislationCs as string) ??
      "Český a evropský regulační rámec: zákon o zdravotních službách, GDPR, EU AI Act a metodiky SÚKL.",
    clinicalImpactCs:
      (meta.clinicalImpactCs as string) ??
      "Digitální nástroje doplňují klinickou praxi — zrychlují komunikaci, monitoring a rozhodování při zachování odpovědnosti lékaře.",
    examplesCs:
      (meta.examplesCs as string) ??
      "eRecept, portál pacienta, videokonzultace, dálkový monitoring a AI decision support.",
    keyPointsCs: Array.isArray(meta.keyPointsCs)
      ? (meta.keyPointsCs as string[])
      : ["Evidence-based přístup", "Regulační compliance", "Integrace do klinické praxe"],
    sources: tierSources,
    publishedDate: row.published_date ?? new Date().toISOString().slice(0, 10),
    publishedDateLabel: formatCsDate(row.published_date),
    imageUrl: row.image_url ?? v21ImageForModule("digitalHealth", row.slug),
  };
}
