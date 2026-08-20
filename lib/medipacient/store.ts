import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { MEDIPACIENT_DEMO_REPORTS } from "@/lib/medipacient/demo-reports";
import { mergeDashboard, publicDemoDashboard } from "@/lib/medipacient/demo-dashboard";
import { documentFromUpload } from "@/lib/medipacient/parse-report";
import type { PacientDashboard, PacientDocument } from "@/lib/medipacient/types";

export { publicDemoDashboard, mergeDashboard };

const AGENT = "medipacient_report";

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
