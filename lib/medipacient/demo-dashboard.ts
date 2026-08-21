import { MEDIPACIENT_DEMO_REPORTS, demoTimeline } from "@/lib/medipacient/demo-reports";
import type { PacientDashboard, PacientDocument, PacientSession } from "@/lib/medipacient/types";
import { MEDIPACIENT } from "@/lib/apps/catalog";

export const GUEST_PACIENT_SESSION: PacientSession = {
  authenticated: false,
  entitled: false,
  owner: false,
  isVip: false,
  reason: "unauthenticated",
  userId: null,
  email: null,
  displayName: null,
  role: null,
  message:
    "Přihlaste se stejným účtem MedScopeGlobal — pak MeDipacient funguje v prohlížeči i v telefonu.",
  loginUrl: `/login?next=${encodeURIComponent(MEDIPACIENT.appPath)}`,
  appUrl: MEDIPACIENT.appPath,
  canUpload: false,
  limits: { timeline: true, upload: false },
  access: {
    authenticated: false,
    accountLabel: "Nepřihlášeni",
    email: null,
    planLabel: "Host · zkušební zprávy",
    entitled: false,
    validUntil: null,
    validityLabel: "po přihlášení",
    loginUrl: `/login?next=${encodeURIComponent(MEDIPACIENT.appPath)}`,
    subscribeUrl: "/predplatne#public",
  },
};

export function mergeDashboard(userDocs: PacientDocument[]): PacientDashboard {
  const documents = [...userDocs, ...MEDIPACIENT_DEMO_REPORTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const diagnoses = Array.from(new Set(documents.flatMap((d) => d.patientSummary.diagnosy)));
  const medications = documents.flatMap((d) => d.patientSummary.leky);
  const medsUnique = medications.filter(
    (m, i) => medications.findIndex((x) => x.name.toLowerCase() === m.name.toLowerCase()) === i
  );
  const labValues = documents.flatMap((d) => d.patientSummary.labValues);
  const questions = Array.from(new Set(documents.flatMap((d) => d.patientSummary.otazky_pro_lekare)));

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
      specialty:
        documents.find((d) => d.patientSummary.termin_kontroly.vypoctene_datum === next?.vypoctene_datum)
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

/** Always-available trial dashboard — safe for client and server. */
export function publicDemoDashboard(): PacientDashboard {
  return mergeDashboard([]);
}
