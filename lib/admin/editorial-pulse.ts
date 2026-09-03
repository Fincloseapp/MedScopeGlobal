import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import {
  MAGAZINE_EDITORS_PER_LOCALE,
  MAGAZINE_WRITERS_PER_LOCALE,
  totalDeployedMagazineEditors,
  totalDeployedMagazineWriters,
} from "@/lib/editorial/locale-magazine-desks";
import { describeDailyWriterPlan } from "@/lib/v25/config/public-writers";
import { mailReady, mailTransportLabel } from "@/lib/monetization/vialongevita-brief";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type EditorialLocalePulse = {
  locale: string;
  label: string;
  articles24h: number;
  articles7d: number;
  writersProduced24h: number;
  writersPlanned: number;
  editorsPlanned: number;
  subscribers: number;
  waitingFirstBrief: number;
};

export type EditorialPulse = {
  loadedAt: string;
  newestPublishedAt: string | null;
  last24h: number;
  last7d: number;
  published: number;
  publicPublished: number;
  missingCover: number;
  withCover: number;
  writersProduced24h: number;
  writersRosterPerLocale: number;
  writersRosterPlannedTotal: number;
  editorsPlannedTotal: number;
  todayLocales: string[];
  rotatingLocale: string;
  expectedArticlesToday: number;
  mailReady: boolean;
  mailTransport: "sendgrid" | "smtp" | "none";
  subscribers: number;
  waitingFirstBrief: number;
  lastEmail: {
    sent_at: string;
    status: string;
    subject: string;
    recipient: string;
    error: string | null;
    provider: string | null;
  } | null;
  byLocale: EditorialLocalePulse[];
};

function localeLabel(code: string): string {
  return GLOBAL_LOCALES.find((item) => item.code === code)?.label ?? code;
}

function normalizeLocaleKey(raw: string | null | undefined): string {
  const value = (raw ?? "cs").trim() || "cs";
  if (value.toLowerCase() === "pt-br") return "pt-BR";
  if (value.toLowerCase() === "en-us") return "en-US";
  if (value.toLowerCase() === "zh-cn") return "zh-CN";
  return value;
}

function writerIdFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const id = (metadata as { writer_id?: unknown }).writer_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

function emptyPulse(): EditorialPulse {
  const plan = describeDailyWriterPlan();
  return {
    loadedAt: new Date().toISOString(),
    newestPublishedAt: null,
    last24h: 0,
    last7d: 0,
    published: 0,
    publicPublished: 0,
    missingCover: 0,
    withCover: 0,
    writersProduced24h: 0,
    writersRosterPerLocale: MAGAZINE_WRITERS_PER_LOCALE,
    writersRosterPlannedTotal: totalDeployedMagazineWriters(),
    editorsPlannedTotal: totalDeployedMagazineEditors(),
    todayLocales: plan.locales,
    rotatingLocale: plan.rotatingLocale,
    expectedArticlesToday: plan.expectedArticles,
    mailReady: mailReady(),
    mailTransport: mailTransportLabel(),
    subscribers: 0,
    waitingFirstBrief: 0,
    lastEmail: null,
    byLocale: GLOBAL_LOCALES.map((item) => ({
      locale: item.code,
      label: item.label,
      articles24h: 0,
      articles7d: 0,
      writersProduced24h: 0,
      writersPlanned: MAGAZINE_WRITERS_PER_LOCALE,
      editorsPlanned: MAGAZINE_EDITORS_PER_LOCALE,
      subscribers: 0,
      waitingFirstBrief: 0,
    })),
  };
}

export function formatPulseDate(iso: string | null | undefined): string {
  if (!iso) return "zatím žádný";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("cs-CZ");
}

export async function loadEditorialPulse(): Promise<EditorialPulse> {
  const pulse = emptyPulse();
  const admin = tryCreateServiceRoleClient();
  if (!admin) return pulse;

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [publishedRes, publicRes, newestRes, recentRes, missingCoverRes, withCoverRes, subsRes, emailRes] =
    await Promise.all([
      admin.from("articles").select("id", { count: "exact", head: true }).eq("published", true),
      admin
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .eq("audience", "public"),
      admin
        .from("articles")
        .select("published_at")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1),
      admin
        .from("articles")
        .select("published_at, locale, metadata, audience")
        .eq("published", true)
        .gte("published_at", since7d)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(2000),
      admin
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .eq("audience", "public")
        .is("cover_image_url", null),
      admin
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("published", true)
        .eq("audience", "public")
        .not("cover_image_url", "is", null),
      admin
        .from("newsletter_subscribers")
        .select("locale, last_brief_sent_at, unsubscribed_at")
        .eq("segment", "public"),
      admin
        .from("email_logs")
        .select("sent_at, status, subject, recipient, error, provider")
        .order("sent_at", { ascending: false })
        .limit(1),
    ]);

  pulse.published = publishedRes.count ?? 0;
  pulse.publicPublished = publicRes.count ?? 0;
  pulse.missingCover = missingCoverRes.count ?? 0;
  pulse.withCover = withCoverRes.count ?? 0;
  pulse.newestPublishedAt = (newestRes.data?.[0] as { published_at?: string } | undefined)?.published_at ?? null;

  const localeMap = new Map(pulse.byLocale.map((row) => [row.locale, row]));
  const writers24h = new Set<string>();
  for (const row of (recentRes.data ?? []) as {
    published_at: string | null;
    locale: string | null;
    metadata: unknown;
  }[]) {
    const locale = normalizeLocaleKey(row.locale);
    const bucket = localeMap.get(locale) ?? localeMap.get("cs");
    if (!bucket) continue;
    bucket.articles7d += 1;
    pulse.last7d += 1;
    const publishedAt = row.published_at ? new Date(row.published_at).getTime() : 0;
    if (publishedAt >= Date.parse(since24h)) {
      bucket.articles24h += 1;
      pulse.last24h += 1;
      const writerId = writerIdFromMetadata(row.metadata);
      if (writerId) {
        writers24h.add(`${locale}:${writerId}`);
      }
    }
  }

  const writersByLocale = new Map<string, Set<string>>();
  for (const key of writers24h) {
    const [locale, writerId] = key.split(":");
    if (!locale || !writerId) continue;
    if (!writersByLocale.has(locale)) writersByLocale.set(locale, new Set());
    writersByLocale.get(locale)!.add(writerId);
  }
  pulse.writersProduced24h = writers24h.size;
  for (const [locale, ids] of writersByLocale) {
    const bucket = localeMap.get(locale);
    if (bucket) bucket.writersProduced24h = ids.size;
  }

  const subs = (subsRes.data ?? []) as {
    locale: string | null;
    last_brief_sent_at: string | null;
    unsubscribed_at: string | null;
  }[];
  for (const row of subs) {
    if (row.unsubscribed_at) continue;
    pulse.subscribers += 1;
    const locale = normalizeLocaleKey(row.locale);
    const bucket = localeMap.get(locale);
    if (bucket) bucket.subscribers += 1;
    if (!row.last_brief_sent_at) {
      pulse.waitingFirstBrief += 1;
      if (bucket) bucket.waitingFirstBrief += 1;
    }
  }

  const last = emailRes.data?.[0] as EditorialPulse["lastEmail"] | undefined;
  pulse.lastEmail = last
    ? {
        sent_at: last.sent_at,
        status: last.status,
        subject: last.subject,
        recipient: last.recipient,
        error: last.error ?? null,
        provider: last.provider ?? null,
      }
    : null;

  pulse.byLocale = [...localeMap.values()];
  return pulse;
}
