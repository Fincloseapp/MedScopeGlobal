import { FACULTIES_ADMISSIONS_2026 } from "@/lib/prijimacky/faculties-admissions";
import { generateSelfTest } from "@/lib/prijimacky/quiz-from-bank";
import { bankStats } from "@/lib/prijimacky/question-bank";

export type PrepDashboard = {
  faculties: Array<{
    slug: string;
    shortName: string;
    city: string;
    questions: number;
    minutes: number;
  }>;
  bank: { total: number; bySubject: Record<string, number> };
  weeklyPlan: Array<{ day: string; task: string }>;
  weakTopics: Array<{ topic: string; subject: string; pct: number }>;
  demoScore: { ok: number; total: number; pct: number };
};

export function getPrepDashboard(): PrepDashboard {
  const stats = bankStats();
  const faculties = FACULTIES_ADMISSIONS_2026.map((f) => ({
    slug: f.slug,
    shortName: f.shortName,
    city: f.city,
    questions: f.slug.includes("1") || f.slug.includes("hk") || f.slug.includes("up") ? 60 : 54,
    minutes: f.slug.includes("os") ? 45 : 48,
  }));

  const demo = generateSelfTest({
    subjects: ["biologie", "chemie", "fyzika"],
    count: 12,
    seed: "mediprep-demo-dashboard",
  });

  return {
    faculties,
    bank: stats,
    weeklyPlan: [
      { day: "Po", task: "Kapitola Buňka — 12 otázek biologie" },
      { day: "Út", task: "Mini test chemie (pH, redox) · 10 otázek" },
      { day: "St", task: "Drill slabých míst pod 70 %" },
      { day: "Čt", task: "Fyzika: mechanika + elektřina" },
      { day: "Pá", task: "Simulace vybrané fakulty 20 otázek" },
      { day: "So", task: "Pexeso názvosloví + rychlý kvíz" },
      { day: "Ne", task: "Opakování chyb z týdne, bez nových témat" },
    ],
    weakTopics: [
      { topic: "Genetika", subject: "biologie", pct: 58 },
      { topic: "Redox", subject: "chemie", pct: 62 },
      { topic: "Optika", subject: "fyzika", pct: 67 },
    ],
    demoScore: { ok: 8, total: demo.questions.length, pct: 67 },
  };
}

export function buildPrepTest(opts: {
  mode?: string;
  subject?: string;
  faculty?: string;
  count?: number;
  seed?: string;
}) {
  const subject = opts.subject;
  const subjects =
    !subject || subject === "mixed" || subject === "all"
      ? (["biologie", "chemie", "fyzika"] as const)
      : subject === "biologie" || subject === "chemie" || subject === "fyzika"
        ? ([subject] as const)
        : (["biologie", "chemie", "fyzika"] as const);
  const count = Math.min(40, Math.max(8, Number(opts.count ?? (opts.mode === "simulace" ? 24 : 12)) || 12));
  return generateSelfTest({
    subjects: [...subjects],
    count,
    seed: opts.seed ?? `${opts.faculty ?? "mix"}-${Date.now()}`,
  });
}
