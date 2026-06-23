import type { V19Specialty } from "@/lib/v19/types";

export const V19_SPECIALTY_PRIORITY: V19Specialty[] = [
  "rheumatology",
  "internal-medicine",
  "cardiology",
  "endocrinology",
  "neurology",
  "oncology",
  "infectious-disease",
  "pulmonology",
  "gastroenterology",
  "dermatology",
  "emergency-medicine",
];

export const V19_SPECIALTY_LABELS: Record<V19Specialty, { cs: string; en: string }> = {
  rheumatology: { cs: "Revmatologie", en: "Rheumatology" },
  "internal-medicine": { cs: "Interní medicína", en: "Internal medicine" },
  cardiology: { cs: "Kardiologie", en: "Cardiology" },
  endocrinology: { cs: "Endokrinologie", en: "Endocrinology" },
  neurology: { cs: "Neurologie", en: "Neurology" },
  oncology: { cs: "Onkologie", en: "Oncology" },
  "infectious-disease": { cs: "Infekční lékařství", en: "Infectious disease" },
  pulmonology: { cs: "Pneumologie", en: "Pulmonology" },
  gastroenterology: { cs: "Gastroenterologie", en: "Gastroenterology" },
  dermatology: { cs: "Dermatologie", en: "Dermatology" },
  "emergency-medicine": { cs: "Urgentní medicína", en: "Emergency medicine" },
};

/** Build batch specialty mix: ~40% rheumatology, rest rotated. */
export function planSpecialtyBatch(count: number): V19Specialty[] {
  const rheumSlots = Math.max(2, Math.ceil(count * 0.4));
  const others = V19_SPECIALTY_PRIORITY.filter((s) => s !== "rheumatology");
  const plan: V19Specialty[] = [];

  for (let i = 0; i < rheumSlots && plan.length < count; i++) {
    plan.push("rheumatology");
  }
  let o = 0;
  while (plan.length < count) {
    plan.push(others[o % others.length]);
    o += 1;
  }
  return plan.slice(0, count);
}

export function specialtyLabel(specialty: V19Specialty, locale: string): string {
  const labels = V19_SPECIALTY_LABELS[specialty];
  return locale === "cs" || locale.startsWith("cs") ? labels.cs : labels.en;
}
