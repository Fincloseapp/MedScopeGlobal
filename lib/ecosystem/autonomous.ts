/** Autonomous operation configuration — content, SEO, ads, translations */

export type AutonomousTask =
  | "generate-articles"
  | "translate-content"
  | "add-images"
  | "seo-optimize"
  | "place-ads"
  | "generate-vip-content"
  | "generate-affiliate-boxes"
  | "generate-donation-cta"
  | "switch-locale"
  | "mediflow-daily-reset"
  | "editorial-queue"
  | "syndicate-articles";

export const AUTONOMOUS_SCHEDULE: Record<AutonomousTask, { cron: string; description: string }> = {
  "generate-articles": {
    cron: "0 6 * * *",
    description: "Generování bezpečných článků (LLM + editorial review)",
  },
  "translate-content": {
    cron: "0 8 * * *",
    description: "Automatický překlad do všech jazykových mutací",
  },
  "add-images": {
    cron: "0 9 * * *",
    description: "Přidání royalty-free / AI obrázků ke článkům",
  },
  "seo-optimize": {
    cron: "0 10 * * *",
    description: "SEO úpravy: metadata, keywords, JSON-LD",
  },
  "place-ads": {
    cron: "0 */4 * * *",
    description: "Automatické umístění reklam (high-CTR pozice)",
  },
  "generate-vip-content": {
    cron: "0 7 * * 1",
    description: "Generování VIP longevity obsahu",
  },
  "generate-affiliate-boxes": {
    cron: "0 11 * * *",
    description: "Generování affiliate boxů v článcích",
  },
  "generate-donation-cta": {
    cron: "0 12 * * *",
    description: "Generování darovacích CTA u článků",
  },
  "switch-locale": {
    cron: "0 * * * *",
    description: "Geolokace → automatické přepnutí jazyka",
  },
  "mediflow-daily-reset": {
    cron: "0 4 * * *",
    description: "MediFlow: reset denního stavu suplementů (taken_today)",
  },
  "editorial-queue": {
    cron: "0 5 * * *",
    description: "Autonomní redakční fronta — téma, persona, compliance review",
  },
  "syndicate-articles": {
    cron: "0 14 * * *",
    description: "Syndikace článků mezi locale redakcemi (adaptace, ne duplikace)",
  },
};

/** Safety guardrails for autonomous content generation */
export const CONTENT_GUARDRAILS = {
  maxArticlesPerDay: 5,
  requireEditorialReview: true,
  blockedTopics: [
    "lethal dosage",
    "self-harm",
    "unproven cures",
    "miracle claims",
    "diagnosis without disclaimer",
  ],
  requiredDisclaimers: true,
  maxTranslationBatch: 50,
  humanReviewLocales: ["en-US", "ru", "zh-CN"] as const,
};

/** Cron endpoint auth — uses CRON_SECRET from env */
export function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
