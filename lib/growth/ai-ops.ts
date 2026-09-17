/** Operational snapshot for /admin/ai-agents — completed work, not vanity 170k. */

import { emptyPulse, loadEditorialPulse, type EditorialPulse } from "@/lib/admin/editorial-pulse";
import { AI_AGENT_SLUGS, legalChannels } from "@/lib/growth/ai-agent-program";
import { evaluateProgramGoals } from "@/lib/growth/ai-agent-eval";
import {
  AI_AGENT_REMEDIATIONS,
  loadAiAgentGrowthSnapshot,
  type AgentRow,
  type AiAgentGrowthSnapshot,
} from "@/lib/growth/ai-agent-stats";
import { lastMarketplaceLoop } from "@/lib/sales/marketplace-loop";
import { listOutreach, listRuns, salesDb } from "@/lib/sales/store";
import { listMarketplaceListings, marketplaceDb } from "@/lib/marketplace/store";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { mailReady, mailTransportLabel } from "@/lib/monetization/vialongevita-brief";

export type OpsAgentStatus = "done" | "work" | "running" | "blocked" | "empty";

export type OpsAgent = {
  id: string;
  name: string;
  job: string;
  completed: string;
  count: number;
  status: OpsAgentStatus;
  statusLabel: string;
  href: string;
  action: "run_editorial" | "run_newsletter" | "run_sales" | "run_marketplace" | "run_arena" | "run_growth" | null;
};

export type AiOpsSnapshot = {
  loadedAt: string;
  dataSource: AiAgentGrowthSnapshot["dataSource"];
  error?: string;
  nearMissed: boolean;
  sep27Open: boolean;
  liveSubscribers: number;
  payingSubscribers: number;
  newsletterSubscribers: number;
  articles7d: number;
  articles24h: number;
  articlesPublished: number;
  newsletterIssuesThisWeek: number;
  lastEmailAt: string | null;
  lastEmailStatus: string | null;
  v27PaidOrders: number;
  v27PaidCzk: number;
  marketplaceListings: number;
  lastSalesRunAt: string | null;
  lastSalesRunOk: boolean | null;
  outreachSent: number;
  outreachReplied: number;
  mailReady: boolean;
  mailTransport: string;
  honesty: string;
  agents: OpsAgent[];
  leaderboard: AgentRow[];
  remediations: readonly string[];
  pulse: EditorialPulse;
  growth: AiAgentGrowthSnapshot;
};

function statusFromWork(count: number, blocked: boolean, money: number): OpsAgentStatus {
  if (blocked) return "blocked";
  if (money > 0) return "done";
  if (count > 0) return "work";
  return "empty";
}

function statusLabel(status: OpsAgentStatus): string {
  if (status === "done") return "peníze přišly";
  if (status === "work") return "práce hotová, 0 Kč";
  if (status === "running") return "běží";
  if (status === "blocked") return "blokováno";
  return "zatím nic";
}

function isoWeekMondayUtcYmd(at = new Date()): string {
  const x = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  const day = x.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10);
}

async function countPublishedNewslettersThisWeek(): Promise<number> {
  const admin = tryCreateServiceRoleClient({ timeoutMs: 4_000 });
  if (!admin) return 0;
  try {
    const from = isoWeekMondayUtcYmd();
    const { count, error } = await admin
      .from("newsletters")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .gte("issue_date", from);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function loadAiOpsSnapshot(): Promise<AiOpsSnapshot> {
  try {
    return await Promise.race([
      loadAiOpsSnapshotUnsafe(),
      new Promise<AiOpsSnapshot>((_, reject) => {
        setTimeout(() => reject(new Error("ai_ops_timeout")), 8_000);
      }),
    ]);
  } catch (err) {
    return emptyOps(err instanceof Error ? err.message : "ai_ops_failed");
  }
}

export function emptyOps(error?: string): AiOpsSnapshot {
  const goals = evaluateProgramGoals(0, 0);
  const growth: AiAgentGrowthSnapshot = {
    loadedAt: new Date().toISOString(),
    dataSource: "unavailable",
    subscribers: { active: 0, trialing: 0, totalLive: 0, newsletter: 0, vip: 0 },
    revenue: { v27PaidOrders: 0, v27PaidCzk: 0 },
    goals,
    pace: { last7: 0, dailyAvg7: 0 },
    visibility: { visible: false, last3: 0, prev3: 0, label: "nenačteno" },
    daily: [],
    leaderboard: AI_AGENT_SLUGS.map((agent) => ({
      agent,
      visits: 0,
      checkouts: 0,
      paid: 0,
      newsletters: 0,
    })),
    channels: legalChannels(),
  };
  return buildOps({
    error,
    pulse: emptyPulse(),
    growth,
    newsletterIssuesThisWeek: 0,
    marketplaceListings: 0,
    lastSalesRunAt: null,
    lastSalesRunOk: null,
    outreachSent: 0,
    outreachReplied: 0,
  });
}

async function loadAiOpsSnapshotUnsafe(): Promise<AiOpsSnapshot> {
  const [pulse, growth, newsletterIssuesThisWeek] = await Promise.all([
    loadEditorialPulse(),
    loadAiAgentGrowthSnapshot(),
    countPublishedNewslettersThisWeek(),
  ]);

  let lastSalesRunAt: string | null = null;
  let lastSalesRunOk: boolean | null = null;
  let outreachSent = 0;
  let outreachReplied = 0;
  try {
    const db = salesDb(4_000);
    if (db) {
      const [runs, outreach] = await Promise.all([listRuns(db, 1), listOutreach(db, 400)]);
      if (runs[0]) {
        lastSalesRunAt = runs[0].finished_at ?? runs[0].started_at;
        lastSalesRunOk = runs[0].ok;
        const summarySent = Number(runs[0].summary?.sent ?? 0);
        if (Number.isFinite(summarySent) && summarySent > outreachSent) outreachSent = summarySent;
      }
      outreachSent = outreach.filter((row) => row.status === "sent").length;
      outreachReplied = outreach.filter((row) => row.status === "replied").length;
    }
  } catch {
    /* sales tables may be missing */
  }

  let marketplaceListings = 0;
  try {
    const db = marketplaceDb(4_000);
    if (db) {
      const rows = await listMarketplaceListings(db, 80);
      marketplaceListings = rows.length;
    }
  } catch {
    marketplaceListings = 0;
  }

  return buildOps({
    pulse,
    growth,
    newsletterIssuesThisWeek,
    marketplaceListings,
    lastSalesRunAt,
    lastSalesRunOk,
    outreachSent,
    outreachReplied,
  });
}

function buildOps(input: {
  error?: string;
  pulse: EditorialPulse;
  growth: AiAgentGrowthSnapshot;
  newsletterIssuesThisWeek: number;
  marketplaceListings: number;
  lastSalesRunAt: string | null;
  lastSalesRunOk: boolean | null;
  outreachSent: number;
  outreachReplied: number;
}): AiOpsSnapshot {
  const now = new Date();
  const nearMissed = now.getTime() > Date.parse("2026-09-10T23:59:59.000Z");
  const sep27Open = now.getTime() <= Date.parse("2026-09-27T23:59:59.000Z");
  const pulse = input.pulse;
  const growth = input.growth;
  const live = growth.subscribers.totalLive;
  const paying = growth.subscribers.active;
  const mailOk = mailReady();
  const loop = lastMarketplaceLoop();

  const editorialCount = pulse?.last7d ?? 0;
  const paidCzk = growth.revenue.v27PaidCzk;
  const editorialStatus: OpsAgentStatus =
    pulse && pulse.last24h > 0 ? "running" : statusFromWork(editorialCount, false, 0);

  const newsletterCount = input.newsletterIssuesThisWeek;
  const briefWaiting = pulse?.waitingFirstBrief ?? 0;
  const newsletterStatus = statusFromWork(newsletterCount, !mailOk, 0);

  const salesMoney = 0;
  const salesWork = input.outreachSent + (input.lastSalesRunAt ? 1 : 0);
  const salesStatus: OpsAgentStatus =
    input.lastSalesRunOk === false || !mailOk
      ? "blocked"
      : statusFromWork(salesWork, false, salesMoney);

  const marketStatus: OpsAgentStatus = statusFromWork(
    input.marketplaceListings + (loop?.evaluation.percent ?? 0),
    false,
    0
  );

  const paidExternal = growth.leaderboard.reduce((sum, row) => sum + row.paid, 0);
  const visitsExternal = growth.leaderboard.reduce((sum, row) => sum + row.visits, 0);
  const arenaStatus: OpsAgentStatus = paidExternal > 0 ? "done" : visitsExternal > 0 ? "work" : "empty";
  const growthStatus: OpsAgentStatus = paidCzk > 0 ? "done" : "empty";

  const agents: OpsAgent[] = [
    {
      id: "editorial",
      name: "Redakce",
      job: "Články v jazykových mutacích — práce, ne předplatné",
      completed: `${editorialCount.toLocaleString("cs-CZ")} publikovaných za 7 dní · ${pulse?.last24h ?? 0} za 24 h · peníze od předplatitelů to nesplnilo`,
      count: editorialCount,
      status: editorialStatus,
      statusLabel: statusLabel(editorialStatus),
      href: "/admin/articles",
      action: "run_editorial",
    },
    {
      id: "newsletter",
      name: "Newsletter",
      job: "Týdenní vydání + brief podle locale",
      completed: `${newsletterCount.toLocaleString("cs-CZ")} vydání tento týden · čeká na první brief ${briefWaiting.toLocaleString("cs-CZ")}`,
      count: newsletterCount,
      status: newsletterStatus,
      statusLabel: mailOk ? statusLabel(newsletterStatus) : "mail není nastavený — nikomu nedorazí",
      href: "/admin/newsletter",
      action: "run_newsletter",
    },
    {
      id: "sales",
      name: "Obchod",
      job: "Odeslat kampaň a dostat peníze od předplatitelů / inzerentů",
      completed: `odesláno ${input.outreachSent.toLocaleString("cs-CZ")} e-mailů · odpovědí ${input.outreachReplied.toLocaleString("cs-CZ")} · ${
        input.lastSalesRunAt
          ? `poslední běh ${new Date(input.lastSalesRunAt).toLocaleString("cs-CZ")}${input.lastSalesRunOk === false ? " — chyba" : ""}`
          : "zatím žádný uložený běh"
      }`,
      count: input.outreachSent,
      status: salesStatus,
      statusLabel: !mailOk ? "mail není nastavený" : statusLabel(salesStatus),
      href: "/admin/sales",
      action: "run_sales",
    },
    {
      id: "marketplace",
      name: "Tržiště",
      job: "Nabídky, poptávky, modelová smyčka",
      completed: `${input.marketplaceListings.toLocaleString("cs-CZ")} záznamů · smyčka ${loop?.evaluation.percent ?? 0} % (model ≠ platba)`,
      count: input.marketplaceListings,
      status: marketStatus,
      statusLabel: statusLabel(marketStatus),
      href: "/admin/sales?tab=trziste",
      action: "run_marketplace",
    },
    {
      id: "arena",
      name: "Aréna Alfa / Beta",
      job: "Interní souboj — výhra jen zaplacené předplatné",
      completed: `zaplaceno z hopu ${paidExternal.toLocaleString("cs-CZ")} · návštěv ${visitsExternal.toLocaleString("cs-CZ")} (návštěva není výhra)`,
      count: paidExternal,
      status: arenaStatus,
      statusLabel: paidExternal > 0 ? "peníze přišly" : visitsExternal > 0 ? "pipeline, neplatí" : "zatím nic",
      href: "/admin/ai-teams",
      action: "run_arena",
    },
    {
      id: "growth",
      name: "SEO / IndexNow",
      job: "Legální discovery — výhra jen Stripe platba",
      completed: `cron běží · zaplacené v27 ${paidCzk.toLocaleString("cs-CZ")} Kč · platící ${paying.toLocaleString("cs-CZ")}`,
      count: paying,
      status: growthStatus,
      statusLabel: statusLabel(growthStatus),
      href: "/admin/revenue",
      action: "run_growth",
    },
  ];

  const workCount = agents.filter((row) => row.status === "work" || row.status === "running" || row.count > 0).length;
  const moneyCount = agents.filter((row) => row.status === "done").length;

  return {
    loadedAt: now.toISOString(),
    dataSource: growth.dataSource,
    error: input.error,
    nearMissed,
    sep27Open,
    liveSubscribers: live,
    payingSubscribers: paying,
    newsletterSubscribers: pulse?.subscribers ?? growth.subscribers.newsletter,
    articles7d: editorialCount,
    articles24h: pulse?.last24h ?? 0,
    articlesPublished: pulse?.published ?? 0,
    newsletterIssuesThisWeek: input.newsletterIssuesThisWeek,
    lastEmailAt: pulse?.lastEmail?.sent_at ?? null,
    lastEmailStatus: pulse?.lastEmail?.status ?? null,
    v27PaidOrders: growth.revenue.v27PaidOrders,
    v27PaidCzk: paidCzk,
    marketplaceListings: input.marketplaceListings,
    lastSalesRunAt: input.lastSalesRunAt,
    lastSalesRunOk: input.lastSalesRunOk,
    outreachSent: input.outreachSent,
    outreachReplied: input.outreachReplied,
    mailReady: mailOk,
    mailTransport: mailTransportLabel(),
    honesty: nearMissed
      ? `Cíl 170 000 předplatitelů do 10. 9. 2026 je nesplněný. Peníze od předplatitelů teď: ${paidCzk.toLocaleString("cs-CZ")} Kč (${paying.toLocaleString("cs-CZ")} platících, ${live.toLocaleString("cs-CZ")} živých vč. trial). ChatGPT/Claude/Gemini se z cronu nevolají. Oddělení mají záznam práce u ${workCount} z ${agents.length}; peníze přišly u ${moneyCount} z ${agents.length}. Odeslané obchodní e-maily: ${input.outreachSent.toLocaleString("cs-CZ")}, odpovědi: ${input.outreachReplied.toLocaleString("cs-CZ")}.`
      : `Cíl 170 000 do 10. 9. 2026 ještě běží. Peníze od předplatitelů: ${paidCzk.toLocaleString("cs-CZ")} Kč. Neslibujeme čísla, která nejsou v databázi.`,
    agents,
    leaderboard: growth.leaderboard,
    remediations: AI_AGENT_REMEDIATIONS,
    pulse,
    growth,
  };
}
