export const medicalSpecializations = [
  "Všeobecné lékařství",
  "Praktický lékař",
  "Revmatologie",
  "Kardiologie",
  "Klinický výzkum",
  "Interní medicína",
  "Neurologie",
  "Diabetologie",
  "Onkologie",
  "Gastroenterologie"
] as const;

export type MedicalSpecialization = (typeof medicalSpecializations)[number];

export const primarySpecializations: MedicalSpecialization[] = [
  "Všeobecné lékařství",
  "Praktický lékař",
  "Revmatologie",
  "Kardiologie",
  "Klinický výzkum"
];
