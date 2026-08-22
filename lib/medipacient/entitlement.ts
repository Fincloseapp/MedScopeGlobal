export const MEDIPACIENT_PLANS = ["FREE", "MEDIUM", "PREMIUM"] as const;
export type MeDipacientPlan = (typeof MEDIPACIENT_PLANS)[number];

export type MeDipacientFeature =
  | "upload"
  | "basicExtract"
  | "timeline"
  | "graphs"
  | "reminders"
  | "advancedAi"
  | "trends"
  | "pdfExport";

export type MeDipacientPlanLimits = {
  documents: number;
  timeline: boolean;
  graphs: boolean;
  reminders: boolean;
  advancedAi: boolean;
  trends: boolean;
  pdfExport: boolean;
};

/** Hard cap even for paid plans — same order of magnitude as the existing index. */
export const MEDIPACIENT_HARD_DOC_CAP = 200;
export const MEDIPACIENT_FREE_DOC_LIMIT = 20;

export const MEDIPACIENT_PLAN_LIMITS: Record<MeDipacientPlan, MeDipacientPlanLimits> = {
  FREE: {
    documents: MEDIPACIENT_FREE_DOC_LIMIT,
    timeline: false,
    graphs: false,
    reminders: false,
    advancedAi: false,
    trends: false,
    pdfExport: false,
  },
  MEDIUM: {
    documents: MEDIPACIENT_HARD_DOC_CAP,
    timeline: true,
    graphs: true,
    reminders: true,
    advancedAi: false,
    trends: false,
    pdfExport: false,
  },
  PREMIUM: {
    documents: MEDIPACIENT_HARD_DOC_CAP,
    timeline: true,
    graphs: true,
    reminders: true,
    advancedAi: true,
    trends: true,
    pdfExport: true,
  },
};

export const PLAN_UPGRADE_URL = "/predplatne?trial=1";

export const PLAN_COPY_CS: Record<
  MeDipacientPlan,
  { name: string; summary: string }
> = {
  FREE: {
    name: "Zdarma",
    summary: "Až 20 zpráv, text, termín kontroly a doporučení.",
  },
  MEDIUM: {
    name: "Medium",
    summary: "Neomezené zprávy, časová osa, grafy laboratorních hodnot a připomínky.",
  },
  PREMIUM: {
    name: "Premium",
    summary: "Pokročilá AI, odhad trendu laboratorních hodnot a export PDF.",
  },
};

/**
 * Owner / trial e-maily (dawe.zegzul@seznam.cz, admin@…) → PREMIUM.
 * Aktivní VIP/trial hubu → MEDIUM (zatím není samostatný Stripe produkt MeDipacient).
 * Přihlášený účet bez předplatného → FREE.
 */
export function resolveMeDipacientPlan(opts: { owner: boolean; isVip: boolean }): MeDipacientPlan {
  if (opts.owner) return "PREMIUM";
  if (opts.isVip) return "MEDIUM";
  return "FREE";
}

export function limitsForPlan(plan: MeDipacientPlan): MeDipacientPlanLimits {
  return MEDIPACIENT_PLAN_LIMITS[plan];
}

export function canUseMeDipacientFeature(plan: MeDipacientPlan, feature: MeDipacientFeature): boolean {
  const limits = limitsForPlan(plan);
  if (feature === "upload" || feature === "basicExtract") return true;
  if (feature === "timeline") return limits.timeline;
  if (feature === "graphs") return limits.graphs;
  if (feature === "reminders") return limits.reminders;
  if (feature === "advancedAi") return limits.advancedAi;
  if (feature === "trends") return limits.trends;
  if (feature === "pdfExport") return limits.pdfExport;
  return false;
}

export function documentLimitErrorCs(plan: MeDipacientPlan): string {
  const n = limitsForPlan(plan).documents;
  return `Bezplatný tarif umožňuje ${n} zpráv. Další nahrání odemknete v Předplatném.`;
}

export function featureLockedErrorCs(feature: MeDipacientFeature): string {
  if (feature === "timeline") {
    return "Časová osa je v tarifu Medium. Odemknete ji v Předplatném.";
  }
  if (feature === "graphs") {
    return "Grafy laboratorních hodnot jsou v tarifu Medium. Odemknete je v Předplatném.";
  }
  if (feature === "reminders") {
    return "Připomínky kontrol jsou v tarifu Medium. Odemknete je v Předplatném.";
  }
  if (feature === "pdfExport") {
    return "Export PDF je v tarifu Premium. Odemknete ho v Předplatném.";
  }
  if (feature === "trends") {
    return "Odhad trendu je v tarifu Premium. Odemknete ho v Předplatném.";
  }
  if (feature === "advancedAi") {
    return "Pokročilá AI je v tarifu Premium. Odemknete ji v Předplatném.";
  }
  return "Tato funkce je v placeném tarifu. Podívejte se na Předplatné.";
}

export function upgradeCtaCs(feature?: MeDipacientFeature): { title: string; body: string; href: string } {
  if (feature === "timeline") {
    return {
      title: "Časová osa v tarifu Medium",
      body: "Přehled zpráv, kontrol a laboratorních hodnot v čase. 14 dní zdarma, stejný účet jako zbytek webu.",
      href: PLAN_UPGRADE_URL,
    };
  }
  if (feature === "graphs") {
    return {
      title: "Grafy laboratorních hodnot v tarifu Medium",
      body: "Jednoduché grafy CRP, ALT a dalších hodnot ze zpráv. Odemknete v Předplatném.",
      href: PLAN_UPGRADE_URL,
    };
  }
  if (feature === "reminders") {
    return {
      title: "Připomínky v tarifu Medium",
      body: "Upozornění 7 dní a 24 hodin před kontrolou, včetně kalendáře.",
      href: PLAN_UPGRADE_URL,
    };
  }
  if (feature === "pdfExport" || feature === "trends" || feature === "advancedAi") {
    return {
      title: "Premium odemyká PDF a odhad trendu",
      body: "Pokročilá AI, odhad vývoje laboratorních hodnot a stažení srozumitelného PDF.",
      href: PLAN_UPGRADE_URL,
    };
  }
  return {
    title: "Odemknout Medium a Premium",
    body: "Stejné předplatné jako zbytek MedScopeGlobal — 14 dní zdarma, platba kartou.",
    href: PLAN_UPGRADE_URL,
  };
}
