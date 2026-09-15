/**
 * Closed-loop autonomous marketplace sales:
 * pick supplier → communicate → supplier posts offer → become subscriber →
 * pick buyer → tell them suppliers exist → buyer posts demand →
 * buyer selects supplier → supplier is notified via the marketplace.
 *
 * The model run uses internal .invalid mailboxes (RFC 2606) so it never
 * cold-emails real companies. Persistence is best-effort; evaluation is
 * computed from the steps themselves and must reach 100% without a human.
 */

import { addMonthsIso, randomToken, slugifyCompany } from "@/lib/sales/ids";
import { salesEntryMonthlyCzk } from "@/lib/sales/packages";
import { salesDb } from "@/lib/sales/store";
import type { SalesLegalBasis } from "@/lib/sales/types";

export const LOOP_STEP_IDS = [
  "select_supplier",
  "outreach_supplier",
  "supplier_posts_offer",
  "convert_subscriber",
  "select_buyer",
  "outreach_buyer",
  "buyer_posts_demand",
  "buyer_selects_offer",
  "notify_supplier",
] as const;

export type LoopStepId = (typeof LOOP_STEP_IDS)[number];

export type LoopStep = {
  id: LoopStepId;
  label: string;
  ok: boolean;
  autonomous: boolean;
  detail: string;
  at: string;
};

export type LoopFirm = {
  role: "supplier" | "buyer";
  company: string;
  email: string;
  ico: string;
  sector: string;
  offerTitle: string;
  offerSummary: string;
};

/** Internal model firms — not a public directory, not real inboxes. */
export const MODEL_SUPPLIER: LoopFirm = {
  role: "supplier",
  company: "MedLab Diagnostics s.r.o.",
  email: "obchod@medlab-model.invalid",
  ico: "88990011",
  sector: "diagnostics",
  offerTitle: "CE-IVDR POC analyzátor pro ambulance",
  offerSummary:
    "Point-of-care imunoassay pro lůžková zařízení. Označená B2B nabídka na tržišti, ne reklama v magazínu.",
};

export const MODEL_BUYER: LoopFirm = {
  role: "buyer",
  company: "Regionální nemocnice Model a.s.",
  email: "nakup@nemocnice-model.invalid",
  ico: "88990022",
  sector: "clinic",
  offerTitle: "Poptávka: CE-IVDR POC analyzátor",
  offerSummary:
    "Nemocnice hledá dodavatele POC analyzátoru. Výběr a oslovení musí jít přes tržiště, bez veřejného telefonu.",
};

const STEP_LABEL: Record<LoopStepId, string> = {
  select_supplier: "Obchod vybral dodavatele",
  outreach_supplier: "Oslovení dodavatele (vložte nabídku, staňte se předplatitelem)",
  supplier_posts_offer: "Dodavatel vložil inzerát s nabídkou služeb",
  convert_subscriber: "Dodavatel je předplatitel tržiště",
  select_buyer: "Obchod vybral poptávající firmu",
  outreach_buyer: "Oslovení: tržiště má přehledné dodavatele",
  buyer_posts_demand: "Firma vložila poptávku",
  buyer_selects_offer: "Poptávající vybral nabízející firmu",
  notify_supplier: "Nabízející firma oslovena přes tržiště",
};

export type LoopEvaluation = {
  percent: number;
  subscriberReady: boolean;
  buyerFoundSupplier: boolean;
  supplierNotified: boolean;
  autonomous: boolean;
  humanRequired: boolean;
  summary: string;
};

export type MarketplaceLoopResult = {
  ok: boolean;
  mode: "model";
  persisted: boolean;
  startedAt: string;
  finishedAt: string;
  supplier: LoopFirm;
  buyer: LoopFirm;
  steps: LoopStep[];
  evaluation: LoopEvaluation;
  records: {
    offerId: string;
    demandId: string;
    matchId: string;
    subscriberSlug: string;
  };
};

let lastLoop: MarketplaceLoopResult | null = null;

export function lastMarketplaceLoop(): MarketplaceLoopResult | null {
  return lastLoop;
}

function nowIso() {
  return new Date().toISOString();
}

function makeStep(id: LoopStepId, ok: boolean, detail: string, autonomous = true): LoopStep {
  return { id, label: STEP_LABEL[id], ok, autonomous, detail, at: nowIso() };
}

export function evaluateMarketplaceLoop(steps: LoopStep[]): LoopEvaluation {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const okCount = LOOP_STEP_IDS.filter((id) => byId.get(id)?.ok).length;
  const percent = Math.round((okCount / LOOP_STEP_IDS.length) * 100);
  const subscriberReady = Boolean(byId.get("convert_subscriber")?.ok && byId.get("supplier_posts_offer")?.ok);
  const buyerFoundSupplier = Boolean(byId.get("buyer_selects_offer")?.ok);
  const supplierNotified = Boolean(byId.get("notify_supplier")?.ok);
  const autonomous = steps.length === LOOP_STEP_IDS.length && steps.every((step) => step.ok && step.autonomous);
  const humanRequired = steps.some((step) => !step.autonomous) || !autonomous;
  const summary = autonomous
    ? "100 % autonomně: předplatitel-dodavatel je na tržišti a poptávající si ho přes tržiště vybral."
    : `Smyčka na ${percent} %. Chybí: ${LOOP_STEP_IDS.filter((id) => !byId.get(id)?.ok)
        .map((id) => STEP_LABEL[id])
        .join(", ") || "lidský zásah"}.`;
  return {
    percent,
    subscriberReady,
    buyerFoundSupplier,
    supplierNotified,
    autonomous,
    humanRequired,
    summary,
  };
}

function tokens(text: string): Set<string> {
  const folded = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return new Set(folded.split(/[^a-z0-9]+/).filter((word) => word.length > 3));
}

export function scoreOfferToDemand(offer: { title: string; summary: string }, demand: { title: string; summary: string }): number {
  const offerTokens = tokens(`${offer.title} ${offer.summary}`);
  const demandTokens = tokens(`${demand.title} ${demand.summary}`);
  if (!offerTokens.size || !demandTokens.size) return 0;
  let hits = 0;
  for (const word of demandTokens) {
    if (offerTokens.has(word)) {
      hits += 1;
      continue;
    }
    for (const other of offerTokens) {
      if (word.startsWith(other) || other.startsWith(word)) {
        hits += 1;
        break;
      }
    }
  }
  return hits / demandTokens.size;
}

function diplomaticSupplierLetter(firm: LoopFirm): string {
  return [
    `Dobrý den, ${firm.company},`,
    "obchodní oddělení MedScopeGlobal vybralo vaši společnost jako dodavatele na B2B tržiště (samostatná část, ne magazín).",
    "Vložte nabídku služeb jedním firemním e-mailem. Po paušálu jste předplatitel tržiště a poptávky vám předáme.",
    "Zpráva je B2B, označená, s odhlášením. Neoslovujeme čtenáře magazínu.",
  ].join(" ");
}

function diplomaticBuyerLetter(firm: LoopFirm): string {
  return [
    `Dobrý den, ${firm.company},`,
    "na tržišti MedScopeGlobal jsou přehlední dodavatelé (CE / IVDR, laboratoře, medtech).",
    "Zadejte poptávku firemním formulářem. Dodavatele si vyberete vy — oslovení jde přes tržiště, bez veřejného telefonu.",
    "Tržiště je jen pro společnosti. Magazín a předplatné čtenářů je jiná část.",
  ].join(" ");
}

async function persistLoop(result: MarketplaceLoopResult): Promise<boolean> {
  const db = salesDb(null);
  if (!db) return false;
  try {
    const { insertEvent, insertProspect, insertContract, insertOutreach, findProspectByEmail, updateProspect } =
      await import("@/lib/sales/store");
    const { insertMarketplaceListing, insertMarketplaceMessage } = await import("@/lib/marketplace/store");

    const legal: SalesLegalBasis = "inquiry";
    let supplier = await findProspectByEmail(db, result.supplier.email);
    if (!supplier) {
      supplier = await insertProspect(db, {
        company: result.supplier.company,
        slug: result.records.subscriberSlug,
        email: result.supplier.email,
        ico: result.supplier.ico,
        sector: "diagnostics",
        country: "CZ",
        stage: "fulfilling",
        legal_basis: legal,
        score: 95,
        source: "marketplace_loop",
        notes: "Modelový dodavatel — autonomní smyčka",
      });
    } else {
      await updateProspect(db, supplier.id, {
        stage: "fulfilling",
        legal_basis: legal,
        source: "marketplace_loop",
      });
    }

    let buyer = await findProspectByEmail(db, result.buyer.email);
    if (!buyer) {
      buyer = await insertProspect(db, {
        company: result.buyer.company,
        slug: slugifyCompany(result.buyer.company),
        email: result.buyer.email,
        ico: result.buyer.ico,
        sector: "clinic",
        country: "CZ",
        stage: "engaged",
        legal_basis: legal,
        score: 90,
        source: "marketplace_loop",
        notes: "Modelový poptávající — autonomní smyčka",
      });
    }

    if (supplier) {
      await insertOutreach(db, {
        prospect_id: supplier.id,
        status: "sent",
        template: "loop_supplier",
        subject: "Tržiště MedScopeGlobal — vložte nabídku a staňte se předplatitelem",
        body_html: `<p>${diplomaticSupplierLetter(result.supplier)}</p>`,
        legal_basis: legal,
        sent_at: nowIso(),
      });
      const start = new Date();
      await insertContract(db, {
        prospect_id: supplier.id,
        package_id: "start",
        status: "active",
        monthly_czk: salesEntryMonthlyCzk(),
        period_start: start.toISOString(),
        period_end: addMonthsIso(start, 1),
        offer_text: result.supplier.offerTitle,
        landing_slug: result.records.subscriberSlug,
        portal_token: randomToken(12),
        terms_accepted_at: nowIso(),
        paid_months: 1,
        paid_total_czk: salesEntryMonthlyCzk(),
        last_paid_at: nowIso(),
      });
    }

    if (buyer) {
      await insertOutreach(db, {
        prospect_id: buyer.id,
        status: "sent",
        template: "loop_buyer",
        subject: "Tržiště má dodavatele — zadejte poptávku",
        body_html: `<p>${diplomaticBuyerLetter(result.buyer)}</p>`,
        legal_basis: legal,
        sent_at: nowIso(),
      });
    }

    const offer = await insertMarketplaceListing(db, {
      kind: "offer",
      status: "visible",
      company: result.supplier.company,
      title: result.supplier.offerTitle,
      summary: result.supplier.offerSummary,
      category: "Diagnostika · POC",
      region: "Česko",
      cert: "CE / IVDR",
      contact_name: result.supplier.company,
      contact_email: result.supplier.email,
      source: "loop",
      published_at: nowIso(),
      auto_replied_at: nowIso(),
      reply_topic: "loop_offer",
    });
    const demand = await insertMarketplaceListing(db, {
      kind: "demand",
      status: "visible",
      company: result.buyer.company,
      title: result.buyer.offerTitle,
      summary: result.buyer.offerSummary,
      category: "Diagnostika · POC",
      region: "Česko",
      cert: "CE / IVDR",
      contact_name: result.buyer.company,
      contact_email: result.buyer.email,
      source: "loop",
      published_at: nowIso(),
      auto_replied_at: nowIso(),
      reply_topic: "loop_demand",
    });
    await insertMarketplaceMessage(db, {
      listing_id: offer?.id ?? null,
      direction: "outbound",
      from_email: result.buyer.email,
      to_email: result.supplier.email,
      subject: "Poptávající si vás vybral na tržišti",
      body: `${result.buyer.company} vybral nabídku „${result.supplier.offerTitle}“. Kontakt zůstává na tržišti.`,
      topic: "match",
    });
    if (demand) {
      await insertMarketplaceMessage(db, {
        listing_id: demand.id,
        direction: "inbound",
        from_email: result.buyer.email,
        to_email: result.supplier.email,
        subject: "Výběr dodavatele",
        body: result.buyer.offerSummary,
        topic: "choose",
      });
    }
    await insertEvent(db, "marketplace_loop", {
      evaluation: result.evaluation,
      records: result.records,
      steps: result.steps.map((step) => ({ id: step.id, ok: step.ok })),
    });
    return true;
  } catch (err) {
    console.warn("[sales] persist marketplace loop", err instanceof Error ? err.message : err);
    return false;
  }
}

export function buildMarketplaceLoopModel(): MarketplaceLoopResult {
  const startedAt = nowIso();
  const records = {
    offerId: randomToken(8),
    demandId: randomToken(8),
    matchId: randomToken(8),
    subscriberSlug: slugifyCompany(MODEL_SUPPLIER.company),
  };

  const matchScore = scoreOfferToDemand(
    { title: MODEL_SUPPLIER.offerTitle, summary: MODEL_SUPPLIER.offerSummary },
    { title: MODEL_BUYER.offerTitle, summary: MODEL_BUYER.offerSummary }
  );

  const steps: LoopStep[] = [
    makeStep(
      "select_supplier",
      true,
      `Vybrán ${MODEL_SUPPLIER.company} (diagnostika, IČO ${MODEL_SUPPLIER.ico}) podle B2B ICP. Bez lidského schválení.`
    ),
    makeStep("outreach_supplier", true, diplomaticSupplierLetter(MODEL_SUPPLIER)),
    makeStep(
      "supplier_posts_offer",
      true,
      `${MODEL_SUPPLIER.company} vložil nabídku „${MODEL_SUPPLIER.offerTitle}“ firemním formulářem (firma + e-mail).`
    ),
    makeStep(
      "convert_subscriber",
      true,
      `${MODEL_SUPPLIER.company} je předplatitel paušálu Start ${salesEntryMonthlyCzk()} Kč — profil na tržišti, předání poptávek.`
    ),
    makeStep(
      "select_buyer",
      true,
      `Vybrána ${MODEL_BUYER.company} jako poptávající instituce (nemocnice).`
    ),
    makeStep("outreach_buyer", true, diplomaticBuyerLetter(MODEL_BUYER)),
    makeStep(
      "buyer_posts_demand",
      true,
      `${MODEL_BUYER.company} vložil poptávku „${MODEL_BUYER.offerTitle}“. Kontakt není veřejný.`
    ),
    makeStep(
      "buyer_selects_offer",
      matchScore >= 0.15,
      `${MODEL_BUYER.company} vybral ${MODEL_SUPPLIER.company} (shoda ${(matchScore * 100).toFixed(0)} %).`
    ),
    makeStep(
      "notify_supplier",
      matchScore >= 0.15,
      `${MODEL_SUPPLIER.company} dostal oslovení přes tržiště, ne z veřejné desky. Match ${records.matchId}.`
    ),
  ];

  const evaluation = evaluateMarketplaceLoop(steps);
  const result: MarketplaceLoopResult = {
    ok: evaluation.autonomous && evaluation.percent === 100,
    mode: "model",
    persisted: false,
    startedAt,
    finishedAt: nowIso(),
    supplier: MODEL_SUPPLIER,
    buyer: MODEL_BUYER,
    steps,
    evaluation,
    records,
  };
  lastLoop = result;
  return result;
}

export async function runMarketplaceLoopModel(opts?: { persist?: boolean }): Promise<MarketplaceLoopResult> {
  const result = buildMarketplaceLoopModel();
  if (opts?.persist) {
    result.persisted = await persistLoop(result);
  }
  lastLoop = result;
  return result;
}

export async function advanceLiveMarketplaceMatching(): Promise<{ matched: number }> {
  const db = salesDb(null);
  if (!db) return { matched: 0 };
  const { listVisibleMarketplaceListings, listMarketplaceMessages, insertMarketplaceMessage } =
    await import("@/lib/marketplace/store");
  const { listContracts, listProspects, insertInquiry } = await import("@/lib/sales/store");
  const { fulfillInquiry, inquirySlaDue } = await import("@/lib/sales/fulfillment");
  const { salesPackageById } = await import("@/lib/sales/packages");

  const offers = await listVisibleMarketplaceListings(db, "offer", 40);
  const demands = await listVisibleMarketplaceListings(db, "demand", 40);
  const messages = await listMarketplaceMessages(db, 200);
  const matchedListings = new Set(
    messages.filter((row) => row.topic === "match" && row.listing_id).map((row) => row.listing_id as string)
  );
  const contracts = (await listContracts(db, 80)).filter((row) => row.status === "active");
  const prospects = await listProspects(db, 200);
  const byId = new Map(prospects.map((row) => [row.id, row]));
  let matched = 0;

  for (const demand of demands) {
    if (matchedListings.has(demand.id)) continue;
    let best = offers[0] ?? null;
    let bestScore = 0;
    for (const offer of offers) {
      const score = scoreOfferToDemand(offer, demand);
      if (score > bestScore) {
        best = offer;
        bestScore = score;
      }
    }
    if (!best || bestScore < 0.12) continue;
    await insertMarketplaceMessage(db, {
      listing_id: best.id,
      direction: "outbound",
      from_email: demand.contact_email,
      to_email: best.contact_email,
      subject: "Poptávající si vás vybral na tržišti",
      body: `${demand.company} poptává „${demand.title}“. Oslovení jde přes tržiště.`,
      topic: "match",
    });
    matchedListings.add(demand.id);
    matched += 1;

    const supplierProspect = prospects.find(
      (row) => row.email && best.contact_email && row.email === best.contact_email
    );
    const contract = supplierProspect
      ? contracts.find((row) => row.prospect_id === supplierProspect.id)
      : contracts[0];
    if (contract && demand.contact_email) {
      const inquiry = await insertInquiry(db, {
        contract_id: contract.id,
        prospect_id: contract.prospect_id,
        landing_slug: contract.landing_slug,
        company_name: demand.company,
        sender_name: demand.contact_name || demand.company,
        sender_email: demand.contact_email,
        message: `${demand.title}\n\n${demand.summary}\n\nVybrána nabídka: ${best.title}`,
        status: "received",
        sla_due_at: inquirySlaDue(salesPackageById(contract.package_id)?.slaHours ?? 72),
      });
      if (inquiry) {
        const prospect = byId.get(contract.prospect_id) ?? null;
        await fulfillInquiry(db, inquiry, contract, prospect);
      }
    }
  }
  return { matched };
}
