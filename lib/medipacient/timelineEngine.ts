import type { LabValue, Recommendation, VisitPlanStored } from "@/lib/medipacient/medicalParserCZ";
import { isoUtc, toUtcNoon } from "@/lib/medipacient/medicalParserCZ";

export type LabTrend = "zlepšení" | "zhoršení" | "stabilní";

export type TimelineEventKind = "document" | "visit" | "lab" | "recommendation" | "reminder";

export type TimelineEvent = {
  id: string;
  kind: TimelineEventKind;
  dateIso: string;
  title: string;
  body: string;
  documentId: string;
  documentName: string;
  labs?: LabValue[];
  trend?: LabTrend | null;
  where?: string | null;
};

export type LabSeriesPoint = {
  dateIso: string;
  value: number;
  unit: string;
  documentId: string;
  documentName: string;
};

export type LabSeries = {
  name: string;
  unit: string;
  points: LabSeriesPoint[];
  trend: LabTrend;
  latest: LabSeriesPoint;
};

export type TimelineDocumentInput = {
  id: string;
  name: string;
  createdAt: string;
  controlDate?: string | null;
  visitPlan?: VisitPlanStored | null;
  labValues?: LabValue[] | null;
  recommendations?: Recommendation[] | null;
  obor?: string | null;
};

/** Analytes where a lower later value is usually zlepšení. */
const HIGH_WORSE = new Set([
  "CRP",
  "ALT",
  "AST",
  "GGT",
  "LD",
  "glykemie",
  "HbA1c",
  "kreatinin",
  "urea",
  "TK",
  "FW",
  "LDL",
  "INR",
  "Leu",
]);

const LOW_WORSE = new Set(["Hb", "Hct", "Ery", "HDL", "Tr"]);

const STABLE_RATIO = 0.08;

export function trendForAnalyte(name: string, earlier: number, later: number): LabTrend {
  if (!Number.isFinite(earlier) || !Number.isFinite(later) || earlier === 0) {
    const delta = later - earlier;
    if (Math.abs(delta) < 1e-9) return "stabilní";
  }
  const change = Math.abs(later - earlier) / Math.max(Math.abs(earlier), 1e-9);
  if (change <= STABLE_RATIO) return "stabilní";
  const key = name;
  if (HIGH_WORSE.has(key)) return later < earlier ? "zlepšení" : "zhoršení";
  if (LOW_WORSE.has(key)) return later > earlier ? "zlepšení" : "zhoršení";
  return later < earlier ? "zlepšení" : "zhoršení";
}

export function predictNextValue(points: LabSeriesPoint[]): number | null {
  if (points.length < 2) return null;
  const sorted = [...points].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const t1 = toUtcNoon(prev.dateIso).getTime();
  const t2 = toUtcNoon(last.dateIso).getTime();
  if (t2 === t1) return last.value;
  const slope = (last.value - prev.value) / (t2 - t1);
  const nextT = t2 + (t2 - t1);
  return last.value + slope * (nextT - t2);
}

export function buildLabSeries(docs: TimelineDocumentInput[]): LabSeries[] {
  const byName = new Map<string, LabSeriesPoint[]>();
  for (const doc of docs) {
    const dateIso = (doc.createdAt || "").slice(0, 10);
    if (!dateIso) continue;
    for (const lab of doc.labValues || []) {
      const list = byName.get(lab.name) || [];
      list.push({
        dateIso,
        value: lab.value,
        unit: lab.unit,
        documentId: doc.id,
        documentName: doc.name,
      });
      byName.set(lab.name, list);
    }
  }
  const series: LabSeries[] = [];
  for (const [name, points] of byName) {
    const sorted = [...points].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
    if (!sorted.length) continue;
    const latest = sorted[sorted.length - 1];
    const earlier = sorted.length > 1 ? sorted[sorted.length - 2] : latest;
    series.push({
      name,
      unit: latest.unit,
      points: sorted,
      trend: sorted.length > 1 ? trendForAnalyte(name, earlier.value, latest.value) : "stabilní",
      latest,
    });
  }
  return series.sort((a, b) => a.name.localeCompare(b.name, "cs"));
}

function recTitle(rec: Recommendation): string {
  if (rec.kind === "imaging" && rec.target) return `Vyšetření: ${rec.target}`;
  if (rec.kind === "referral" && rec.target) return `Doporučení: ${rec.target}`;
  if (rec.kind === "gp") return "Kontrola u praktického lékaře";
  return rec.text.slice(0, 80) || "Doporučení";
}

export function generateTimelineEvents(docs: TimelineDocumentInput[]): TimelineEvent[] {
  const series = buildLabSeries(docs);
  const trendByName = new Map(series.map((s) => [s.name, s.trend]));
  const events: TimelineEvent[] = [];

  for (const doc of docs) {
    const created = (doc.createdAt || "").slice(0, 10);
    if (created) {
      events.push({
        id: `doc:${doc.id}`,
        kind: "document",
        dateIso: created,
        title: doc.obor ? `Zpráva · ${doc.obor}` : "Lékařská zpráva",
        body: doc.name,
        documentId: doc.id,
        documentName: doc.name,
        labs: doc.labValues || [],
      });
    }

    const visitIso = doc.visitPlan?.dateIso || doc.controlDate || null;
    if (visitIso) {
      events.push({
        id: `visit:${doc.id}:${visitIso}`,
        kind: "visit",
        dateIso: visitIso,
        title: doc.visitPlan?.where ? `Kontrola · ${doc.visitPlan.where}` : "Kontrola u lékaře",
        body: doc.visitPlan?.originalText || "Termín ze zprávy",
        documentId: doc.id,
        documentName: doc.name,
        where: doc.visitPlan?.where ?? null,
      });
    }

    for (const lab of doc.labValues || []) {
      const labDate = created || isoUtc(new Date());
      events.push({
        id: `lab:${doc.id}:${lab.name}:${labDate}`,
        kind: "lab",
        dateIso: labDate,
        title: `${lab.name} ${lab.value} ${lab.unit}`.trim(),
        body: lab.raw,
        documentId: doc.id,
        documentName: doc.name,
        labs: [lab],
        trend: trendByName.get(lab.name) ?? "stabilní",
      });
    }

    for (const rec of doc.recommendations || []) {
      events.push({
        id: `rec:${doc.id}:${rec.kind}:${rec.target || rec.text}`.slice(0, 120),
        kind: "recommendation",
        dateIso: created || visitIso || isoUtc(new Date()),
        title: recTitle(rec),
        body: rec.text,
        documentId: doc.id,
        documentName: doc.name,
        where: rec.target ?? null,
      });
    }
  }

  return events.sort((a, b) => {
    const byDate = a.dateIso.localeCompare(b.dateIso);
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title, "cs");
  });
}

export function pickNextVisit(
  docs: TimelineDocumentInput[],
  todayIso: string,
): TimelineEvent | null {
  const visits = generateTimelineEvents(docs)
    .filter((e) => e.kind === "visit")
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  const upcoming = visits.find((v) => v.dateIso >= todayIso);
  return upcoming || visits[visits.length - 1] || null;
}
