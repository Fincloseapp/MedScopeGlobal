import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  CAMPAIGN_DEADLINE_ISO,
  CAMPAIGN_DEADLINE_LABEL,
  CAMPAIGN_ID,
  CAMPAIGN_PACKAGE_ID,
  CAMPAIGN_STARTED_ON,
  CAMPAIGN_TARGET_MAX,
  CAMPAIGN_TARGET_MIN,
  pragueYmd,
} from "@/lib/sales/campaign-goal";
import { campaignMarketplaceEmail, campaignMarketplaceUrl, campaignPausalUrl } from "@/lib/sales/campaign-copy";
import { CAMPAIGN_ROSTER, campaignSeedsForLocale, type CampaignSeed } from "@/lib/sales/campaign-roster";
import { slugifyCompany } from "@/lib/sales/ids";
import {
  domainMatchesWebsite,
  salesCampaignAutoSendEnabled,
  salesMaxEmailsPerRun,
  unsubscribeToken,
} from "@/lib/sales/legal";
import { salesEntryMonthlyCzk, salesYearlyCzk, salesYearlyEffectiveMonthCzk } from "@/lib/sales/packages";
import { salesUnsubscribeUrl } from "@/lib/sales/copy";
import type { SalesClient } from "@/lib/sales/store";
import type { SalesContract, SalesProspect } from "@/lib/sales/types";
export { campaignMarketplaceEmail } from "@/lib/sales/campaign-copy";

export type SalesCampaignEmailRow = {
  locale: GlobalLocaleCode;
  localeLabel: string;
  country: string;
  company: string;
  website: string;
  email: string;
  role: string;
};

export type SalesCampaignLocaleRow = {
  locale: GlobalLocaleCode;
  label: string;
  country: string;
  marketplaceUrl: string;
  pausalUrl: string;
  sendableCount: number;
  startAdvertisers: number;
  targetMin: number;
  targetMax: number;
  gapMin: number;
  copySubject: string;
  copyText: string;
  copyHtml: string;
};

export type SalesCampaignSnapshot = {
  id: string;
  startedOn: string;
  deadlineAt: string;
  deadlineLabel: string;
  packageId: typeof CAMPAIGN_PACKAGE_ID;
  monthCzk: number;
  yearCzk: number;
  yearEffectiveCzk: number;
  autoLoopDaily: boolean;
  autoCampaignSend: boolean;
  maxEmailsPerRun: number;
  sendableTotal: number;
  localesCovered: number;
  startAdvertisersTotal: number;
  emails: SalesCampaignEmailRow[];
  byLocale: SalesCampaignLocaleRow[];
  honesty: string;
};

const HONESTY =
  "Cíl 250–500 platících inzerentů Start v každé jazykové mutaci je konverzní cíl, ne počet odeslaných mailů. " +
  "Seznam níž jsou jen platné firemní role-schránky na oficiální doméně webu (info@ / marketing@ / media@ …). " +
  "Osobní mailboxy a hádání jmen se neposílají. Peníze na účtu jdou přes Stripe paušál / převod. " +
  `Termín nastavení komunikace a první úhrady: ${CAMPAIGN_DEADLINE_LABEL}.`;

function previewLetter(locale: string) {
  return campaignMarketplaceEmail({
    company: "Název společnosti",
    locale,
    unsubscribeUrl: "https://medscopeglobal.com/api/sales/unsubscribe?email=role%40firma.example&token=preview",
  });
}

export function campaignLetterForSeed(seed: CampaignSeed) {
  const email = seed.email;
  return campaignMarketplaceEmail({
    company: seed.company,
    locale: seed.locale,
    unsubscribeUrl: salesUnsubscribeUrl(email, unsubscribeToken(email)),
  });
}

export function buildCampaignSnapshot(input?: {
  contracts?: Array<Pick<SalesContract, "status" | "package_id" | "prospect_id">>;
  prospects?: Array<Pick<SalesProspect, "id" | "country">>;
}): SalesCampaignSnapshot {
  const monthCzk = salesEntryMonthlyCzk();
  const countryToStart = new Map<string, number>();
  if (input?.contracts && input.prospects) {
    const byId = new Map(input.prospects.map((row) => [row.id, row]));
    for (const contract of input.contracts) {
      if (contract.status !== "active" && contract.status !== "pending_payment") continue;
      if (contract.package_id !== "start") continue;
      const country = byId.get(contract.prospect_id)?.country ?? "";
      countryToStart.set(country, (countryToStart.get(country) ?? 0) + 1);
    }
  }

  const emails: SalesCampaignEmailRow[] = CAMPAIGN_ROSTER.map((row) => ({
    locale: row.locale,
    localeLabel: GLOBAL_LOCALES.find((item) => item.code === row.locale)?.label ?? row.locale,
    country: row.country,
    company: row.company,
    website: row.website,
    email: row.email,
    role: row.role,
  }));

  const byLocale: SalesCampaignLocaleRow[] = GLOBAL_LOCALES.map((item) => {
    const seeds = campaignSeedsForLocale(item.code);
    const letter = previewLetter(item.code);
    const countries = new Set(seeds.map((row) => row.country));
    let startAdvertisers = 0;
    for (const country of countries) {
      startAdvertisers += countryToStart.get(country) ?? 0;
    }
    return {
      locale: item.code,
      label: item.label,
      country: seeds[0]?.country ?? "",
      marketplaceUrl: campaignMarketplaceUrl(item.code),
      pausalUrl: campaignPausalUrl(item.code),
      sendableCount: seeds.length,
      startAdvertisers,
      targetMin: CAMPAIGN_TARGET_MIN,
      targetMax: CAMPAIGN_TARGET_MAX,
      gapMin: Math.max(0, CAMPAIGN_TARGET_MIN - startAdvertisers),
      copySubject: letter.subject,
      copyText: letter.text,
      copyHtml: letter.html,
    };
  });

  return {
    id: CAMPAIGN_ID,
    startedOn: CAMPAIGN_STARTED_ON,
    deadlineAt: CAMPAIGN_DEADLINE_ISO,
    deadlineLabel: CAMPAIGN_DEADLINE_LABEL,
    packageId: CAMPAIGN_PACKAGE_ID,
    monthCzk,
    yearCzk: salesYearlyCzk(monthCzk),
    yearEffectiveCzk: salesYearlyEffectiveMonthCzk(monthCzk),
    autoLoopDaily: true,
    autoCampaignSend: salesCampaignAutoSendEnabled(),
    maxEmailsPerRun: salesMaxEmailsPerRun(),
    sendableTotal: emails.length,
    localesCovered: byLocale.filter((row) => row.sendableCount > 0).length,
    startAdvertisersTotal: [...countryToStart.values()].reduce((sum, n) => sum + n, 0),
    emails,
    byLocale,
    honesty: HONESTY,
  };
}

export function isCampaignProspect(prospect: Pick<SalesProspect, "source">): boolean {
  return prospect.source.startsWith("campaign:");
}

export async function seedCampaignProspects(db: SalesClient): Promise<{ seeded: number; updated: number }> {
  const {
    findProspectByEmail,
    findProspectBySlug,
    findProspectByWebsite,
    insertProspect,
    updateProspect,
  } = await import("@/lib/sales/store");
  const client = db;
  let seeded = 0;
  let updated = 0;
  for (const seed of CAMPAIGN_ROSTER) {
    if (!domainMatchesWebsite(seed.email, seed.website)) continue;
    const slug = slugifyCompany(`${seed.company}-${seed.locale}`);
    const existing =
      (await findProspectByEmail(client, seed.email)) ??
      (await findProspectByWebsite(client, seed.website)) ??
      (await findProspectBySlug(client, slug));
    const notes = `Kampaň ${CAMPAIGN_ID} · ${seed.locale} · role ${seed.role}@ na oficiální doméně`;
    if (!existing) {
      const row = await insertProspect(client, {
        company: seed.company,
        slug,
        website: seed.website,
        email: seed.email,
        sector: seed.sector,
        country: seed.country,
        stage: "qualified",
        legal_basis: "legitimate_interest",
        score: 72,
        notes,
        source: `campaign:${seed.locale}`,
      });
      if (row) seeded += 1;
      continue;
    }
    if (!existing.email || existing.legal_basis === "none" || existing.legal_basis === "unverified_guess") {
      await updateProspect(client, existing.id, {
        email: seed.email,
        website: existing.website ?? seed.website,
        legal_basis: "legitimate_interest",
        stage: existing.stage === "identified" ? "qualified" : existing.stage,
        source: existing.source.startsWith("campaign:") ? existing.source : `campaign:${seed.locale}`,
        notes: existing.notes ?? notes,
      });
      updated += 1;
    }
  }
  return { seeded, updated };
}

export function campaignSourceLocale(source: string): string {
  const match = /^campaign:([A-Za-z0-9-]+)$/.exec(source);
  return match?.[1] ?? "cs";
}

export function alreadyLoopedToday(runs: Array<{ started_at: string; summary: Record<string, unknown> }>): boolean {
  const today = pragueYmd();
  return runs.some((run) => {
    if (!run.summary?.loopDaily) return false;
    return pragueYmd(new Date(run.started_at)) === today;
  });
}
