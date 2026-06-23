import { DRUG_AGENCY_META, DRUG_STATUS_LABELS, type DrugAgencyId } from "@/lib/v4c/drug-sources";
import { ensureCzechText } from "@/lib/v21/enrich";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

export function stripDrugHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function htmlToParagraphs(html: string | null | undefined): string[] {
  if (!html?.trim()) return [];
  const text = stripDrugHtml(html);
  return text
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 24);
}

export function agencyLabelCs(agency: string | null | undefined): string {
  const key = (agency ?? "sukl") as DrugAgencyId;
  return DRUG_AGENCY_META[key]?.short ?? agency?.toUpperCase() ?? "SÚKL";
}

export function statusLabelCs(status: string | null | undefined): string {
  if (!status) return "Novinka";
  return DRUG_STATUS_LABELS[status] ?? status;
}

export type DrugNewsArticle = {
  title: string;
  lead: string;
  paragraphs: string[];
  agencyLabel: string;
  statusLabel: string;
  dateLabel: string;
  drugName: string | null;
};

export function buildDrugNewsArticle(
  drug: DrugNewsRow,
  dateLabel: string
): DrugNewsArticle {
  const title = ensureCzechText(drug.title, "Léková novinka");
  const bodyParagraphs = htmlToParagraphs(drug.body);
  const summary = ensureCzechText(
    drug.summary,
    bodyParagraphs[0] ??
      `Regulatorní informace k léčivým přípravkům — přehled pro českou klinickou praxi.`
  );

  let paragraphs = bodyParagraphs;
  if (!paragraphs.length) {
    paragraphs = summary
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30);
  }
  if (!paragraphs.length) paragraphs = [summary];

  const lead =
    summary.length > 40 && summary !== paragraphs[0] ? summary : (paragraphs[0] ?? summary);
  const rest =
    lead === paragraphs[0] ? paragraphs.slice(1) : paragraphs.filter((p) => p !== lead);

  return {
    title,
    lead,
    paragraphs: rest.length ? rest : paragraphs.slice(1),
    agencyLabel: agencyLabelCs(drug.agency),
    statusLabel: statusLabelCs(drug.status),
    dateLabel,
    drugName: drug.drug_name,
  };
}
