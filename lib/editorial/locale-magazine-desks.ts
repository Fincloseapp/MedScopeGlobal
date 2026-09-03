/**
 * Native magazine desk per global locale — same geometry as Czech:
 * 5 categories × 4 senior specialists + multi-editor bench.
 * No personal portraits or bylines.
 */

import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  WRITER_SPECIALTY_IDS,
  WRITER_DESKS,
  WRITERS_PER_CATEGORY,
} from "@/lib/editorial/writer-agents";

export const MAGAZINE_CATEGORY_COUNT = WRITER_DESKS.length;
export const MAGAZINE_WRITERS_PER_LOCALE = MAGAZINE_CATEGORY_COUNT * WRITERS_PER_CATEGORY;
export const MAGAZINE_EDITORS_PER_LOCALE = 6;

export type LocaleEditorSeat = {
  id: string;
  role: "editor" | "language_reviewer" | "compliance_reviewer";
  label: string;
};

export type LocaleMagazineDesk = {
  locale: GlobalLocaleCode;
  native: true;
  writers: number;
  writersPerCategory: number;
  categories: number;
  editorBench: LocaleEditorSeat[];
  borrowPolicy: "native-first";
  mayCommentOnForeign: true;
};

const EDITOR_SEATS: Omit<LocaleEditorSeat, "id">[] = [
  { role: "editor", label: "Editor-in-chief" },
  { role: "editor", label: "Section editor" },
  { role: "editor", label: "Diplomatic editor" },
  { role: "language_reviewer", label: "Language / grammar editor" },
  { role: "compliance_reviewer", label: "Medical compliance editor" },
  { role: "compliance_reviewer", label: "Legal editor" },
];

const LOCAL_HEALTH_HINT: Record<string, string> = {
  cs: "Česko: praktický lékař, VZP/ZP, tísňová 155",
  sk: "Slovensko: všeobecný lekár, 155/112",
  pl: "Polska: POZ, NFZ, 112",
  de: "DACH: Hausarzt, gesetzliche Kasse, 112",
  fr: "France: médecin traitant, Assurance maladie, 15/112",
  it: "Italia: medico di base, SSN, 118/112",
  es: "España: médico de familia, SNS, 112",
  pt: "Portugal: médico de família, SNS, 112",
  "pt-BR": "Brasil: UBS/SUS, SAMU 192",
  ro: "România: medic de familie, 112",
  hu: "Magyarország: háziorvos, 112",
  ru: "Россия: терапевт, 103/112",
  uk: "Україна: сімейний лікар, 103",
  be: "Беларусь: тэрапеўт, 103",
  "zh-CN": "中国：社区医院、120",
  ja: "日本：かかりつけ医、119/救急",
  ko: "한국: 의원, 119",
  vi: "Việt Nam: bác sĩ gia đình, 115",
  id: "Indonesia: puskesmas, 118/119",
  en: "International English: GP / family doctor, 112 or local emergency",
  "en-US": "USA: PCP, insurance networks, 911",
  "en-UK": "UK: GP, NHS, 999/111",
};

export function localHealthHint(locale: GlobalLocaleCode): string {
  return LOCAL_HEALTH_HINT[locale] ?? LOCAL_HEALTH_HINT.en!;
}

export function localeEditorBench(locale: GlobalLocaleCode): LocaleEditorSeat[] {
  const tag = locale.toLowerCase();
  return EDITOR_SEATS.map((seat, index) => ({
    ...seat,
    id: `editor-${tag}-${index + 1}-${seat.role}`,
  }));
}

export function localeMagazineDesk(locale: GlobalLocaleCode): LocaleMagazineDesk {
  return {
    locale,
    native: true,
    writers: MAGAZINE_WRITERS_PER_LOCALE,
    writersPerCategory: WRITERS_PER_CATEGORY,
    categories: MAGAZINE_CATEGORY_COUNT,
    editorBench: localeEditorBench(locale),
    borrowPolicy: "native-first",
    mayCommentOnForeign: true,
  };
}

export function allLocaleMagazineDesks(): LocaleMagazineDesk[] {
  return GLOBAL_LOCALES.map((item) => localeMagazineDesk(item.code));
}

export function totalDeployedMagazineWriters(): number {
  return GLOBAL_LOCALES.length * MAGAZINE_WRITERS_PER_LOCALE;
}

export function totalDeployedMagazineEditors(): number {
  return GLOBAL_LOCALES.length * MAGAZINE_EDITORS_PER_LOCALE;
}

export function writerIdsForLocale(locale: GlobalLocaleCode): string[] {
  return WRITER_DESKS.flatMap((desk) =>
    WRITER_SPECIALTY_IDS.map((specialty) => `${locale}:${desk.deskId}-${specialty}`)
  );
}

export { WRITER_SPECIALTY_IDS, WRITERS_PER_CATEGORY };
