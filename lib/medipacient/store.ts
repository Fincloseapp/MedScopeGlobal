import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { MEDIPACIENT_DEMO_REPORTS, demoTimeline } from "@/lib/medipacient/demo-reports";
import { documentFromUpload } from "@/lib/medipacient/parse-report";
import type { PacientDashboard, PacientDocument } from "@/lib/medipacient/types";

const AGENT = "medipacient_report";

function mergeDashboard(userDocs: PacientDocument[]): PacientDashboard {
  const documents = [...userDocs, ...MEDIPACIENT_DEMO_REPORTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const diagnoses = Array.from(
    new Set(documents.flatMap((d) => d.patientSummary.diagnosy))
  );
  const medications = documents.flatMap((d) => d.patientSummary.leky);
  const medsUnique = medications.filter(
    (m, i) => medications.findIndex((x) => x.name.toLowerCase() === m.name.toLowerCase()) === i
  );
  const labValues = documents.flatMap((d) => d.patientSummary.labValues);
  const questions = Array.from(
    new Set(documents.flatMap((d) => d.patientSummary.otazky_pro_lekare))
  );

  const upcoming = documents
    .map((d) => d.patientSummary.termin_kontroly)
    .filter((t) => t.nalezeno && t.vypoctene_datum)
    .sort((a, b) => String(a.vypoctene_datum).localeCompare(String(b.vypoctene_datum)));
  const next = upcoming[0];

  const timeline = [
    ...userDocs.map((doc) => ({
      id: doc.id,
      date: doc.createdAt,
      title: doc.title,
      kind: doc.kind,
      demo: false as const,
      highlight: doc.excerpt,
    })),
    ...demoTimeline(),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    documents,
    timeline,
    nextVisit: {
      date: next?.vypoctene_datum ?? null,
      label: next?.puvodni_text ?? "Zatím bez naplánované kontroly",
      specialty: documents.find((d) => d.patientSummary.termin_kontroly.vypoctene_datum === next?.vypoctene_datum)
        ?.patientSummary.obor_lekare ?? null,
    },
    labValues,
    medications: medsUnique,
    diagnoses,
    questions,
    stats: {
      reports: documents.length,
      diagnoses: diagnoses.length,
      meds: medsUnique.length,
      upcoming: upcoming.length,
    },
  };
}

export function publicDemoDashboard(): PacientDashboard {
  return mergeDashboard([]);
}

type StoredRow = {
  kind: "medipacient_report";
  note: PacientDocument;
};

async function listUserDocuments(userId: string): Promise<PacientDocument[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];
  try {
    const { data, error } = await admin
      .from("ai_agent_logs")
      .select("details, created_at")
      .eq("user_id", userId)
      .eq("agent", AGENT)
      .order("created_at", { ascending: false })
      .limit(80);
    if (error || !data) return [];
    return data
      .map((row) => {
        const details = row.details as StoredRow | PacientDocument | null;
        if (details && typeof details === "object" && "kind" in details && details.kind === "medipacient_report") {
          return details.note;
        }
        if (details && typeof details === "object" && "patientSummary" in details) {
          return details as PacientDocument;
        }
        return null;
      })
      .filter((d): d is PacientDocument => Boolean(d));
  } catch {
    return [];
  }
}

export async function getPacientDashboard(userId?: string | null): Promise<PacientDashboard> {
  if (!userId) return publicDemoDashboard();
  const docs = await listUserDocuments(userId);
  return mergeDashboard(docs);
}

export async function savePacientDocument(
  userId: string,
  fields: { filename: string; text: string }
): Promise<PacientDocument> {
  const doc = documentFromUpload({
    id: crypto.randomUUID(),
    filename: fields.filename,
    text: fields.text,
  });
  const admin = tryCreateServiceRoleClient();
  if (!admin) return doc;
  const { error } = await admin.from("ai_agent_logs").insert({
    user_id: userId,
    agent: AGENT,
    prompt_hash: doc.id.slice(0, 32),
    status: "ok",
    details: { kind: "medipacient_report", note: doc },
  });
  if (error) throw new Error(error.message);
  return doc;
}

export async function getPacientDocument(
  userId: string | null | undefined,
  id: string
): Promise<PacientDocument | null> {
  const demo = MEDIPACIENT_DEMO_REPORTS.find((d) => d.id === id);
  if (demo) return demo;
  if (!userId) return null;
  const docs = await listUserDocuments(userId);
  return docs.find((d) => d.id === id) ?? null;
}

export function dashboardLabValues(dash: PacientDashboard) {
  return dash.labValues;
}

export function dashboardNextVisit(dash: PacientDashboard) {
  return dash.nextVisit;
}
