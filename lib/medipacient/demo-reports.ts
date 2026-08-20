import type { PacientDocument } from "@/lib/medipacient/types";

/** Trial / demo reports — always shown so the app demonstrates full capability. */
export const MEDIPACIENT_DEMO_REPORTS: PacientDocument[] = [
  {
    id: "demo-vysetreni-12-05",
    title: "Vstupní vyšetření u praktického lékaře",
    facility: "Ordinace praktického lékaře · Praha 6",
    kind: "vysetreni",
    createdAt: "2026-05-12T08:40:00.000Z",
    excerpt:
      "Kontrola krevního tlaku, glykémie a medikace. Nově zahájen perindopril, pokračuje metformin.",
    fullText: `AMBULANTNÍ ZPRÁVA — praktický lékař
Datum: 12. 5. 2026
Pacient: zkušební ukázka (anonymizováno)

Subj.: Únava po obědě, občasné bolesti hlavy. Rodinná anamnéza infarktu u otce v 58 letech.

Obj.: TK 148/92 mmHg, P 78/min, BMI 29,2. Asp. pulmo čisté, akce srdeční pravidelná.

Dg.:
I10 Esenciální (primární) hypertenze
E11.9 Diabetes mellitus 2. typu bez komplikací
E78.5 Hyperlipidemie NS

Terapie:
Metformin 1000 mg 1-0-1
Perindopril 5 mg 1-0-0 (nově)
Atorvastatin 20 mg 0-0-1

Plán: kontrola TK za 14 dní, laboratoř (glykovaný hemoglobin, lipidový profil, kreatinin) do 4 týdnů.
Kontrola 28. 5. 2026.

Poučení: sůl do 5 g/den, 150 min chůze týdně, selfmonitoring TK.`,
    demo: true,
    ocrReady: true,
    patientSummary: {
      obor_lekare: "Praktické lékařství",
      diagnosy: [
        "I10 Esenciální hypertenze",
        "E11.9 Diabetes mellitus 2. typu",
        "E78.5 Hyperlipidemie",
      ],
      leky: [
        { name: "Metformin", dose: "1000 mg", schedule: "1-0-1" },
        { name: "Perindopril", dose: "5 mg", schedule: "1-0-0 · nově" },
        { name: "Atorvastatin", dose: "20 mg", schedule: "0-0-1" },
      ],
      labValues: [
        { name: "TK", value: "148/92", unit: "mmHg", flag: "high" },
        { name: "P", value: "78", unit: "/min", flag: "normal" },
        { name: "BMI", value: "29,2", flag: "high" },
      ],
      termin_kontroly: {
        nalezeno: true,
        vypoctene_datum: "2026-05-28",
        puvodni_text: "Kontrola 28. 5. 2026",
      },
      otazky_pro_lekare: [
        "Mám měřit tlak ráno i večer, nebo stačí jednou denně?",
        "Kdy mám začít perindopril, pokud mi dnes klesl tlak pod 120?",
      ],
      doporuceni: [
        "Sůl do 5 g/den",
        "150 minut chůze týdně",
        "Selfmonitoring krevního tlaku",
      ],
    },
  },
  {
    id: "demo-doporuceni-15-05",
    title: "Doporučení ke kardiologovi",
    facility: "Praktický lékař · žádanka",
    kind: "doporuceni",
    createdAt: "2026-05-15T11:10:00.000Z",
    excerpt: "Žádost o EKG a zhodnocení Lp(a) při rodinné zátěži ICHS.",
    fullText: `ŽÁDANKA / DOPORUČENÍ
15. 5. 2026 — kardiologie

Důvod: nově zjištěná hypertenze, rodinná zátěž infarktu, BMI 29.
Žádáme: klidové EKG, zvážení Lp(a) jednou za život, úprava antihypertenzní léčby.

Medikace: metformin, perindopril 5 mg, atorvastatin 20 mg.

Kontrola u praktika po vyšetření, nejpozději 28. 5. 2026.`,
    demo: true,
    ocrReady: true,
    patientSummary: {
      obor_lekare: "Kardiologie (žádanka)",
      diagnosy: ["I10 Esenciální hypertenze", "Rodinná zátěž ICHS"],
      leky: [
        { name: "Perindopril", dose: "5 mg", schedule: "1-0-0" },
        { name: "Atorvastatin", dose: "20 mg", schedule: "0-0-1" },
      ],
      labValues: [],
      termin_kontroly: {
        nalezeno: true,
        vypoctene_datum: "2026-05-28",
        puvodni_text: "nejpozději 28. 5. 2026",
      },
      otazky_pro_lekare: [
        "Má smysl vyšetřit Lp(a), když LDL teprve klesá po statinu?",
        "Potřebuji Holter, nebo stačí klidové EKG?",
      ],
      doporuceni: ["Klidové EKG", "Zvážit Lp(a) jednou za život"],
    },
  },
  {
    id: "demo-kontrola-28-05",
    title: "Kontrola krevního tlaku",
    facility: "Ordinace praktického lékaře · Praha 6",
    kind: "kontrola",
    createdAt: "2026-05-28T07:55:00.000Z",
    excerpt: "TK klesl na 132/84. Perindopril ponechán. Laboratoř naplánována na 5. 6.",
    fullText: `KONTROLA 28. 5. 2026

Home TK průměr 7 dní: 136/86. V ordinaci 132/84 mmHg, P 72.
Bez kašle, bez otoků. Perindopril tolerován.

Plán: biochemie 5. 6. 2026 (HbA1c, lipidový profil, eGFR).
Další kontrola po laboratoři, orientačně 12. 7. 2026.

Ponechat: metformin 1000 mg 1-0-1, perindopril 5 mg, atorvastatin 20 mg.`,
    demo: true,
    ocrReady: true,
    patientSummary: {
      obor_lekare: "Praktické lékařství",
      diagnosy: ["I10 Esenciální hypertenze — zlepšení"],
      leky: [
        { name: "Metformin", dose: "1000 mg", schedule: "1-0-1" },
        { name: "Perindopril", dose: "5 mg", schedule: "1-0-0" },
        { name: "Atorvastatin", dose: "20 mg", schedule: "0-0-1" },
      ],
      labValues: [
        { name: "TK ordinace", value: "132/84", unit: "mmHg", flag: "high" },
        { name: "TK domácí průměr", value: "136/86", unit: "mmHg", flag: "high" },
      ],
      termin_kontroly: {
        nalezeno: true,
        vypoctene_datum: "2026-07-12",
        puvodni_text: "Další kontrola 12. 7. 2026",
      },
      otazky_pro_lekare: ["Mám zvyšovat perindopril, pokud domácí TK zůstane nad 135?"],
      doporuceni: ["Laboratoř 5. 6. 2026", "Pokračovat v chůzi a omezení soli"],
    },
  },
  {
    id: "demo-laborator-05-06",
    title: "Laboratorní výsledky — biochemie",
    facility: "Synlab / smluvní laboratoř",
    kind: "laborator",
    createdAt: "2026-06-05T06:20:00.000Z",
    excerpt: "HbA1c 7,2 %. LDL 3,4. eGFR v normě. Statin ponechán, dietní režim.",
    fullText: `LABORATORNÍ ZPRÁVA 5. 6. 2026

Glykovaný hemoglobin HbA1c 7,2 % (cíl < 7,0)
Glukóza nalačno 7,8 mmol/l
LDL cholesterol 3,4 mmol/l (cíl < 2,6)
HDL 1,1 mmol/l
TAG 2,1 mmol/l
Kreatinin 78 µmol/l
eGFR 92 ml/min/1,73 m²
ALT 0,42 µkat/l

Komentář: kompenzace diabetu hraniční, lipidový profil se zlepšuje. Kontrola u praktika 12. 7. 2026.`,
    demo: true,
    ocrReady: true,
    patientSummary: {
      obor_lekare: "Klinická biochemie",
      diagnosy: ["E11.9 DM2 — HbA1c 7,2 %", "E78.5 Hyperlipidemie — LDL 3,4"],
      leky: [{ name: "Atorvastatin", dose: "20 mg", schedule: "0-0-1" }],
      labValues: [
        { name: "HbA1c", value: "7,2", unit: "%", ref: "< 7,0", flag: "high" },
        { name: "Glukóza nalačno", value: "7,8", unit: "mmol/l", ref: "3,9–5,6", flag: "high" },
        { name: "LDL", value: "3,4", unit: "mmol/l", ref: "< 2,6", flag: "high" },
        { name: "HDL", value: "1,1", unit: "mmol/l", ref: "> 1,0", flag: "normal" },
        { name: "TAG", value: "2,1", unit: "mmol/l", ref: "< 1,7", flag: "high" },
        { name: "eGFR", value: "92", unit: "ml/min", flag: "normal" },
        { name: "ALT", value: "0,42", unit: "µkat/l", flag: "normal" },
      ],
      termin_kontroly: {
        nalezeno: true,
        vypoctene_datum: "2026-07-12",
        puvodni_text: "Kontrola u praktika 12. 7. 2026",
      },
      otazky_pro_lekare: [
        "Stačí dieta, nebo už má smysl přidat druhý antidiabetikum?",
        "Mám zvýšit atorvastatin na 40 mg?",
      ],
      doporuceni: ["Snížit přidané cukry", "Kontrola u praktika 12. 7."],
    },
  },
  {
    id: "demo-dalsi-krok-12-07",
    title: "Plán dalšího kroku — kompenzace a prevence",
    facility: "Ordinace praktického lékaře · Praha 6",
    kind: "prevence",
    createdAt: "2026-07-12T09:05:00.000Z",
    excerpt:
      "Cíl TK < 130/80, HbA1c < 7 %. Screening: praktický screening rakoviny dle věku. Další laboratoř za 3 měsíce.",
    fullText: `KONTROLA 12. 7. 2026 — plán dalšího kroku

TK 128/80, domácí průměr 130/82. Perindopril ponechán.
HbA1c z června 7,2 % — cíl < 7 % do října.
Screening: u žen/mužů dle věku (mamografie / kolonoskopie / HPV) — objednat přes praktika.

Další laboratoř: říjen 2026 (HbA1c, LDL, eGFR).
Ponechat stávající medikaci. Edukace hypoglykemie při námaze.

Toto je zkušební zpráva MedScopeGlobal — ukázka, jak MeDipacient skládá časovou osu.`,
    demo: true,
    ocrReady: true,
    patientSummary: {
      obor_lekare: "Praktické lékařství",
      diagnosy: ["I10 Hypertenze — cíl TK < 130/80", "E11.9 DM2 — cíl HbA1c < 7 %"],
      leky: [
        { name: "Metformin", dose: "1000 mg", schedule: "1-0-1" },
        { name: "Perindopril", dose: "5 mg", schedule: "1-0-0" },
        { name: "Atorvastatin", dose: "20 mg", schedule: "0-0-1" },
      ],
      labValues: [{ name: "TK", value: "128/80", unit: "mmHg", flag: "normal" }],
      termin_kontroly: {
        nalezeno: true,
        vypoctene_datum: "2026-10-12",
        puvodni_text: "Další laboratoř říjen 2026",
      },
      otazky_pro_lekare: [
        "Který screening mám objednat jako první podle věku?",
        "Mám si koupit glukometr, nebo stačí laboratoř?",
      ],
      doporuceni: [
        "Laboratoř v říjnu 2026",
        "Objednat věkově příslušný screening",
        "Edukace hypoglykemie při sportu",
      ],
    },
  },
];

export function demoTimeline() {
  return MEDIPACIENT_DEMO_REPORTS.map((doc) => ({
    id: doc.id,
    date: doc.createdAt,
    title: doc.title,
    kind: doc.kind,
    demo: true as const,
    highlight: doc.excerpt,
  }));
}
