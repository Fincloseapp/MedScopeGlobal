/** Autonomous editorial ("redakce") ecosystem — desks, personas, syndication, compliance */

export * from "./desks";
export * from "./personas";
export * from "./syndication";
export * from "./compliance";

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
