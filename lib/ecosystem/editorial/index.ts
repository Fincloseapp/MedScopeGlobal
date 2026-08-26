/** Autonomous editorial ("redakce") ecosystem — desks, personas, syndication, compliance */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { getDeskForLocale, pickTopicForDesk, type EditorialTopic } from "./desks";
import { getJournalistForTopic, getReviewPipeline } from "./personas";

export * from "./desks";
export * from "./personas";
export * from "./syndication";
export * from "./compliance";
export * from "./images";

export type EditorialQueueItem = {
  id: string;
  deskId: string;
  locale: string;
  topic: string;
  status: "queued" | "writing" | "reviewing" | "compliance" | "published" | "failed";
  journalistPersonaId?: string;
  createdAt: string;
};

/** Scaffold editorial queue item for autonomous cron */
export function createEditorialQueueItem(
  deskId: string,
  locale: string,
  topic: string,
  journalistPersonaId?: string
): EditorialQueueItem {
  return {
    id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deskId,
    locale,
    topic,
    status: "queued",
    journalistPersonaId,
    createdAt: new Date().toISOString(),
  };
}

/** Daily editorial queue cron — wired from cloudflare-cron.yml and /api/ecosystem/autonomous */
export async function runEditorialQueueCron(): Promise<{
  ok: true;
  task: "editorial-queue";
  status: "queued";
  items: number;
  queued: EditorialQueueItem[];
  timestamp: string;
}> {
  const locales: GlobalLocaleCode[] = ["cs", "sk", "en-US", "de"];
  const queued: EditorialQueueItem[] = [];

  for (const locale of locales) {
    const desk = getDeskForLocale(locale);
    const topic = pickTopicForDesk(desk) as EditorialTopic;
    const journalist = getJournalistForTopic(locale, topic);
    const reviewers = getReviewPipeline(locale);
    const item = createEditorialQueueItem(desk.id, locale, topic, journalist?.id);
    queued.push(item);

    const admin = tryCreateServiceRoleClient();
    if (admin) {
      const { error } = await admin.from("editorial_queue").insert({
        desk_id: desk.id,
        locale,
        topic,
        status: "queued",
        journalist_persona_id: journalist?.id ?? null,
        editor_persona_id: reviewers.find((r) => r.role === "editor")?.id ?? null,
        metadata: {
          queue_ref: item.id,
          review_pipeline: reviewers.map((r) => ({ id: r.id, role: r.role })),
          vip_cta_weight: desk.vipCtaWeight,
        },
      });
      if (error) console.warn("[editorial-queue] insert:", error.message);
    }
  }

  return {
    ok: true,
    task: "editorial-queue",
    status: "queued",
    items: queued.length,
    queued,
    timestamp: new Date().toISOString(),
  };
}
