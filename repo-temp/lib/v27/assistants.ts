/** v27.1 AI assistants — audience routing to existing AI routes */
import type { V27Audience } from "@/lib/v27/config";

export interface V27AiAssistant {
  id: string;
  audience: V27Audience;
  label: string;
  description: string;
  href: string;
  apiRoute: string;
}

export const V27_AI_ASSISTANTS: V27AiAssistant[] = [
  {
    id: "public",
    audience: "public",
    label: "AI pro veřejnost",
    description: "Prevence, symptomy, životní styl",
    href: "/ai-asistent/verejnost",
    apiRoute: "/api/ai-medical/patient",
  },
  {
    id: "student",
    audience: "student",
    label: "AI tutor",
    description: "Anatomie, farmakologie, zkoušky",
    href: "/studenti/ai-tutor",
    apiRoute: "/api/ai-medical/univerzity",
  },
  {
    id: "physician",
    audience: "physician",
    label: "Klinický AI",
    description: "Guidelines, diagnostika, studie",
    href: "/lekari/ai-asistent",
    apiRoute: "/api/ai-medical/doctor",
  },
];

export function getV27AssistantForAudience(audience: V27Audience): V27AiAssistant | undefined {
  return V27_AI_ASSISTANTS.find((a) => a.audience === audience);
}
