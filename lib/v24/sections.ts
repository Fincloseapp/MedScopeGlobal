import type { V24SectionId, V24SpecialtyId, V24StudyYear } from "@/lib/v24/types";

export type V24SectionConfig = {
  id: V24SectionId;
  label: string;
  cronId: string;
  contentTypes: string[];
  specialties?: V24SpecialtyId[];
  studyYears?: V24StudyYear[];
  batchSize: number;
};

export const V24_SPECIALTIES: V24SpecialtyId[] = [
  "revmatologie",
  "neurologie",
  "endokrinologie",
  "kardiologie",
  "interna",
  "vseobecne-lekarstvi",
  "dermatologie",
  "alergologie",
  "zobrazovaci-metody",
];

export const V24_SECTIONS: V24SectionConfig[] = [
  {
    id: "medicine",
    label: "Obecná medicína",
    cronId: "v24-medicine",
    contentTypes: ["article", "differential-diagnosis", "treatment-plan", "case-study"],
    batchSize: 2,
  },
  {
    id: "drugs",
    label: "Léky a farmakologie",
    cronId: "v24-drugs",
    contentTypes: ["article"],
    batchSize: 2,
  },
  {
    id: "legislation",
    label: "Legislativa a úhrady",
    cronId: "v24-legislation",
    contentTypes: ["article"],
    batchSize: 1,
  },
  {
    id: "digital-health",
    label: "Digitální zdravotnictví",
    cronId: "v24-digital-health",
    contentTypes: ["article"],
    batchSize: 1,
  },
  {
    id: "news",
    label: "Novinky",
    cronId: "v24-news",
    contentTypes: ["article"],
    batchSize: 2,
  },
  {
    id: "study",
    label: "Studium medicíny",
    cronId: "v24-study",
    contentTypes: ["study-guide", "article"],
    studyYears: [1, 2, 3, 4, 5, 6],
    batchSize: 2,
  },
  {
    id: "pre-med",
    label: "Příprava na medicínu",
    cronId: "v24-pre-med",
    contentTypes: ["study-guide", "article"],
    batchSize: 1,
  },
  {
    id: "specialties",
    label: "Lékařské obory",
    cronId: "v24-specialties",
    contentTypes: ["article", "differential-diagnosis", "case-study"],
    specialties: V24_SPECIALTIES,
    batchSize: 2,
  },
  {
    id: "articles",
    label: "Odborné články",
    cronId: "v24-articles",
    contentTypes: ["article"],
    batchSize: 2,
  },
  {
    id: "quizzes",
    label: "Kvízy a studijní hry",
    cronId: "v24-quizzes",
    contentTypes: ["quiz"],
    batchSize: 1,
  },
];

export function getV24Section(id: V24SectionId) {
  return V24_SECTIONS.find((s) => s.id === id);
}
