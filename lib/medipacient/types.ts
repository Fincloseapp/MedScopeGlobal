export type LabValue = {
  name: string;
  value: string;
  unit?: string;
  ref?: string;
  flag?: "low" | "high" | "normal" | "critical";
};

export type Medication = {
  name: string;
  dose?: string;
  schedule?: string;
};

export type PatientSummary = {
  obor_lekare: string;
  diagnosy: string[];
  leky: Medication[];
  labValues: LabValue[];
  termin_kontroly: {
    nalezeno: boolean;
    vypoctene_datum: string | null;
    puvodni_text: string | null;
  };
  otazky_pro_lekare: string[];
  doporuceni: string[];
};

export type PacientDocument = {
  id: string;
  title: string;
  facility: string;
  kind: "vysetreni" | "laborator" | "doporuceni" | "kontrola" | "prevence" | "upload";
  createdAt: string;
  excerpt: string;
  fullText: string;
  demo: boolean;
  ocrReady: boolean;
  patientSummary: PatientSummary;
};

export type PacientTimelineItem = {
  id: string;
  date: string;
  title: string;
  kind: PacientDocument["kind"];
  demo: boolean;
  highlight?: string;
};

export type PacientDashboard = {
  documents: PacientDocument[];
  timeline: PacientTimelineItem[];
  nextVisit: {
    date: string | null;
    label: string;
    specialty: string | null;
  };
  labValues: LabValue[];
  medications: Medication[];
  diagnoses: string[];
  questions: string[];
  stats: {
    reports: number;
    diagnoses: number;
    meds: number;
    upcoming: number;
  };
};

export type PacientSession = {
  authenticated: boolean;
  entitled: boolean;
  owner: boolean;
  isVip: boolean;
  reason: "ok" | "unauthenticated" | "ok_demo";
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  message: string;
  loginUrl: string;
  appUrl: string;
  canUpload: boolean;
  limits: { timeline: boolean; upload: boolean };
};
