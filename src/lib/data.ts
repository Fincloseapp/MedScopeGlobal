import type { Article, FunnelMetric, MedicalEvent } from "./types";

export const roles = ["doctor", "student", "scientist", "partner"] as const;
export const specializations = ["Kardiologie", "Onkologie", "Neurologie", "Praktické lékařství", "Digitální zdraví", "Farmacie"] as const;
export const regions = ["Česko", "Slovensko", "Evropa", "Globální"] as const;

export const articles: Article[] = [
  { id: "a-001", slug: "ai-triage-primary-care", title: "AI triage v primární péči: praktický rámec pro bezpečné zavedení", summary: "Jak využít klinickou AI pro rychlejší orientaci pacienta bez ztráty odborného dohledu.", content: "AI triage pomáhá prioritizovat pacienty, ale musí být navržena jako podpůrný systém. Základem je audit vstupních dat, jasná odpovědnost lékaře, měření falešně negativních výstupů a průběžné vyhodnocování dopadu na čekací doby.", author: "MUDr. Eva Horáková", date: "2026-05-20", source: "MedScopeGlobal Editorial", specialization: "Digitální zdraví", region: "Evropa", readingTime: 5, tags: ["AI", "primární péče", "bezpečnost"], featured: true },
  { id: "a-002", slug: "cardio-prevention-2026", title: "Kardiovaskulární prevence 2026: co měnit v každodenní praxi", summary: "Nové preventivní postupy, které zvyšují adherenci a snižují riziko rehospitalizace.", content: "Moderní prevence kombinuje personalizovanou edukaci, monitorování krevního tlaku v domácím prostředí a rychlou úpravu léčby podle rizikového profilu. Největší dopad má jednoduchý plán kontroly a srozumitelná komunikace s pacientem.", author: "Prof. Jan Marek", date: "2026-04-28", source: "European Cardiology Review", specialization: "Kardiologie", region: "Česko", readingTime: 4, tags: ["prevence", "adherence", "kardiologie"] },
  { id: "a-003", slug: "oncology-real-world-evidence", title: "Real-world evidence v onkologii: od registrů k rozhodování", summary: "Jak propojit registry, lokální data a klinickou interpretaci pro lepší léčebné cesty.", content: "Real-world evidence doplňuje klinické studie o pohled na každodenní populaci pacientů. Hodnotu přináší zejména tam, kde jsou data kvalitně kurátorovaná, harmonizovaná a klinicky interpretovatelná.", author: "RNDr. Petra Novotná, Ph.D.", date: "2026-03-16", source: "MedScope Research Brief", specialization: "Onkologie", region: "Globální", readingTime: 6, tags: ["RWE", "registry", "onkologie"] }
];

export const events: MedicalEvent[] = [
  { id: "e-001", slug: "digital-health-prague-2026", title: "Digital Health Prague 2026", description: "Konference o bezpečné digitalizaci zdravotnictví, AI nástrojích a interoperabilitě.", startsAt: "2026-09-18T09:00:00+02:00", endsAt: "2026-09-18T17:00:00+02:00", timezone: "Europe/Prague", region: "Česko", format: "hybrid", specialization: "Digitální zdraví", organizer: "MedScopeGlobal", venue: "Praha + online stream", registrationUrl: "https://medscopeglobal.com/events/digital-health-prague-2026", approved: true },
  { id: "e-002", slug: "oncology-data-roundtable", title: "Oncology Data Roundtable", description: "Odborný kulatý stůl k využití reálných dat v onkologických centrech.", startsAt: "2026-10-07T13:00:00+02:00", endsAt: "2026-10-07T16:00:00+02:00", timezone: "Europe/Prague", region: "Evropa", format: "online", specialization: "Onkologie", organizer: "MedScope Research Network", registrationUrl: "https://medscopeglobal.com/events/oncology-data-roundtable", approved: true },
  { id: "e-003", slug: "cardiology-prevention-forum", title: "Cardiology Prevention Forum", description: "Praktické workshopy k prevenci, adherenci a vzdálenému monitoringu pacientů.", startsAt: "2026-11-12T10:00:00+01:00", endsAt: "2026-11-12T15:30:00+01:00", timezone: "Europe/Prague", region: "Slovensko", format: "in-person", specialization: "Kardiologie", organizer: "Central European Cardiology Group", venue: "Bratislava", approved: true }
];

export const funnelMetrics: FunnelMetric[] = [
  { label: "Visit", value: "100%", detail: "Vstupní návštěvy z organiky, referralů a kampaní" },
  { label: "Engagement", value: "42%", detail: "Čtení článků, filtry událostí, kliknutí na CTA" },
  { label: "Registration", value: "11%", detail: "Uložené role a preference pro personalizaci" },
  { label: "Return usage", value: "24%", detail: "Návrat k doporučenému obsahu a událostem" },
  { label: "Conversion", value: "7%", detail: "B2B lead, kontakt nebo kalendářový export" }
];
