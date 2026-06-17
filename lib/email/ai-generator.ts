import fs from "node:fs";
import path from "node:path";
import { generateTextFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";

export type EmailAiKind =
  | "transactional"
  | "marketing"
  | "newsletter"
  | "invoice"
  | "alert-doctor"
  | "alert-student"
  | "alert-public";

export type EmailAiAudience = "public" | "student" | "physician" | "doctor";

export interface EmailAiInput {
  kind: EmailAiKind;
  audience?: EmailAiAudience;
  subjectHint?: string;
  context?: Record<string, unknown>;
  locale?: string;
}

export interface EmailAiOutput {
  subject: string;
  html: string;
  text: string;
  stub: boolean;
  provider: string;
}

const STUBS: Record<EmailAiKind, (audience?: EmailAiAudience) => EmailAiOutput> = {
  transactional: () => ({
    subject: "Potvrzení — MedScopeGlobal",
    html: "<p>Děkujeme za použití MedScopeGlobal.</p>",
    text: "Děkujeme za použití MedScopeGlobal.",
    stub: true,
    provider: "stub",
  }),
  marketing: () => ({
    subject: "Novinky z MedScopeGlobal",
    html: "<p>Objevte nejnovější články a nástroje pro zdraví a studium medicíny.</p>",
    text: "Objevte nejnovější články a nástroje pro zdraví a studium medicíny.",
    stub: true,
    provider: "stub",
  }),
  newsletter: () => ({
    subject: "MedScopeGlobal — týdenní přehled",
    html: "<p>Váš týdenní přehled zdravotnických novinek a studijních tipů.</p>",
    text: "Váš týdenní přehled zdravotnických novinek a studijních tipů.",
    stub: true,
    provider: "stub",
  }),
  invoice: () => ({
    subject: "Faktura — MedScopeGlobal",
    html: "<p>V příloze naleznete fakturu za vaše předplatné MedScopeGlobal.</p>",
    text: "V příloze naleznete fakturu za vaše předplatné MedScopeGlobal.",
    stub: true,
    provider: "stub",
  }),
  "alert-doctor": () => ({
    subject: "Odborný alert — MedScopeGlobal",
    html: "<p>Nový odborný obsah nebo guideline vyžaduje vaši pozornost.</p>",
    text: "Nový odborný obsah nebo guideline vyžaduje vaši pozornost.",
    stub: true,
    provider: "stub",
  }),
  "alert-student": () => ({
    subject: "Studijní update — MedScopeGlobal",
    html: "<p>Nové studijní materiály a kvízy jsou k dispozici v Academy.</p>",
    text: "Nové studijní materiály a kvízy jsou k dispozici v Academy.",
    stub: true,
    provider: "stub",
  }),
  "alert-public": () => ({
    subject: "Zdravotní update — MedScopeGlobal",
    html: "<p>Důležité informace o prevenci a veřejném zdraví.</p>",
    text: "Důležité informace o prevenci a veřejném zdraví.",
    stub: true,
    provider: "stub",
  }),
};

function audienceLabel(audience?: EmailAiAudience): string {
  if (audience === "student") return "studenti medicíny";
  if (audience === "physician" || audience === "doctor") return "lékaři v praxi";
  return "veřejnost";
}

function systemForKind(kind: EmailAiKind, audience?: EmailAiAudience): string {
  const aud = audienceLabel(audience);
  const base = `Jsi e-mailový copywriter MedScopeGlobal (český zdravotnický magazín). Piš profesionálně, stručně, v češtině. Cílová skupina: ${aud}.`;
  const formats: Record<EmailAiKind, string> = {
    transactional: `${base} Vrať JSON: { "subject": "...", "html": "...", "text": "..." }. HTML: jednoduchý responsive e-mail bez scriptů.`,
    marketing: `${base} Marketingový tón, bez přehnaných slibů. JSON stejný formát.`,
    newsletter: `${base} Týdenní newsletter — úvod + 2-3 odstavce. JSON stejný formát.`,
    invoice: `${base} Transakční e-mail k faktuře. JSON stejný formát.`,
    "alert-doctor": `${base} Urgentní odborný alert pro lékaře. JSON stejný formát.`,
    "alert-student": `${base} Studijní notifikace pro studenty LF. JSON stejný formát.`,
    "alert-public": `${base} Veřejný zdravotní update, srozumitelný jazyk. JSON stejný formát.`,
  };
  return formats[kind];
}

export async function generateEmailContent(input: EmailAiInput): Promise<EmailAiOutput> {
  const stub = STUBS[input.kind](input.audience);
  if (!isLlmConfigured()) return stub;

  const user = `Typ: ${input.kind}
Publikum: ${audienceLabel(input.audience)}
Nápověda k předmětu: ${input.subjectHint ?? "—"}
Kontext: ${JSON.stringify(input.context ?? {})}
Jazyk: ${input.locale ?? "cs"}`;

  try {
    const raw = await generateTextFromLlm({
      system: systemForKind(input.kind, input.audience),
      user,
      maxTokens: 1200,
      temperature: 0.35,
    });
    if (!raw) return stub;

    const parsed = JSON.parse(raw) as { subject?: string; html?: string; text?: string };
    if (!parsed.subject || !parsed.html) return stub;

    return {
      subject: parsed.subject.slice(0, 200),
      html: parsed.html,
      text: parsed.text ?? parsed.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      stub: false,
      provider: "llm",
    };
  } catch {
    return stub;
  }
}

export function loadEmailTemplate(name: string, vars: Record<string, string> = {}): string {
  const file = path.join(process.cwd(), "app", "email-templates", `${name}.html`);
  if (!fs.existsSync(file)) {
    return `<html><body><p>Šablona ${name} nenalezena.</p></body></html>`;
  }
  let html = fs.readFileSync(file, "utf8");
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}
