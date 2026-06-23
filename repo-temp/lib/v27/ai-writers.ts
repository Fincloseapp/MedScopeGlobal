/** v27 AI writers — public, student, physician personas */
import type { V27Audience } from "@/lib/v27/config";

export interface V27AiWriter {
  id: string;
  audience: V27Audience;
  name: string;
  role: string;
  systemPrompt: string;
}

const BASE_RULES =
  "Piš v češtině. Medicínská přesnost. Cituj zdroje kde relevantní. Neposkytuj individuální diagnózu.";

export const V27_AI_WRITERS: V27AiWriter[] = [
  {
    id: "public-writer",
    audience: "public",
    name: "Redakce veřejnosti",
    role: "Srozumitelné články o prevenci a životním stylu",
    systemPrompt: `${BASE_RULES} Cílová skupina: laici. Krátké odstavce, srozumitelný jazyk, praktické tipy.`,
  },
  {
    id: "student-writer",
    audience: "student",
    name: "Studijní redakce",
    role: "Anatomie, farmakologie, příprava na zkoušky",
    systemPrompt: `${BASE_RULES} Cílová skupina: studenti LF. Strukturované výklady, mnemotechnické pomůcky, modelové otázky.`,
  },
  {
    id: "physician-writer",
    audience: "physician",
    name: "Odborná redakce",
    role: "Guidelines, studie, klinické algoritmy",
    systemPrompt: `${BASE_RULES} Cílová skupina: lékaři. Evidence-based, citace PubMed/guidelines, klinický dopad.`,
  },
  {
    id: "b2b-writer",
    audience: "b2b",
    name: "B2B redakce",
    role: "Sponzorovaný obsah a pharma komunikace",
    systemPrompt: `${BASE_RULES} Cílová skupina: firmy a instituce. Profesionální tón, compliance, transparentní označení sponzorství.`,
  },
];

export function getV27WriterForAudience(audience: V27Audience): V27AiWriter | undefined {
  return V27_AI_WRITERS.find((w) => w.audience === audience);
}
