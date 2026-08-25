/** MediFlow — wellness tracking types */

export type MediFlowNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
};

export type MediFlowSavedArticle = {
  id: string;
  articleSlug: string;
  articleTitle: string;
  savedAt: string;
  excerpt?: string;
};

export type MediFlowSymptom = {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  loggedAt: string;
};

export type MediFlowSupplement = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
  protocolSlug?: string;
};

export type MediFlowSession = {
  email: string | null;
  isGuest: boolean;
  isVip: boolean;
  syncedAt: string | null;
};

export type MediFlowDashboard = {
  notes: MediFlowNote[];
  savedArticles: MediFlowSavedArticle[];
  symptoms: MediFlowSymptom[];
  supplements: MediFlowSupplement[];
  streakDays: number;
};

export const GUEST_MEDIFLOW_SESSION: MediFlowSession = {
  email: null,
  isGuest: true,
  isVip: false,
  syncedAt: null,
};

export function demoMediFlowDashboard(): MediFlowDashboard {
  const now = new Date().toISOString();
  return {
    notes: [
      { id: "n1", title: "Ranní rutina", body: "Meditace 10 min, studená sprcha 3 min", createdAt: now, updatedAt: now, tags: ["rutina"] },
    ],
    savedArticles: [
      { id: "a1", articleSlug: "optimalizace-spanku", articleTitle: "Jak zlepšit kvalitu spánku", savedAt: now, excerpt: "Vědecky podložené tipy pro lepší spánek." },
    ],
    symptoms: [
      { id: "s1", name: "Únava", severity: 2, loggedAt: now },
    ],
    supplements: [
      { id: "sup1", name: "Magnesium glycinát", dosage: "400 mg", frequency: "Večer", takenToday: true, protocolSlug: "optimalizace-spanku" },
      { id: "sup2", name: "Vitamín D3", dosage: "4000 IU", frequency: "Ráno", takenToday: false },
    ],
    streakDays: 7,
  };
}

/** Local storage key for offline sync */
export const MEDIFLOW_STORAGE_KEY = "mediflow_data_v1";
