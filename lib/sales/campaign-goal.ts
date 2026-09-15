/** Marketplace advertiser campaign — Start paušál, localized locales, Prague deadline. */

export const CAMPAIGN_ID = "marketplace_start_2026_09";
export const CAMPAIGN_STARTED_ON = "2026-09-15";
/** 18 September 2026 14:00 Europe/Prague (CEST = UTC+2). */
export const CAMPAIGN_DEADLINE_ISO = "2026-09-18T12:00:00.000Z";
export const CAMPAIGN_DEADLINE_LABEL = "18. 9. 2026 14:00 (Europe/Prague)";
export const CAMPAIGN_TARGET_MIN = 250;
export const CAMPAIGN_TARGET_MAX = 500;
export const CAMPAIGN_PACKAGE_ID = "start" as const;

export function pragueYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function campaignDeadlinePassed(now = new Date()): boolean {
  return now.getTime() >= new Date(CAMPAIGN_DEADLINE_ISO).getTime();
}

export function campaignHoursLeft(now = new Date()): number {
  return Math.max(0, (new Date(CAMPAIGN_DEADLINE_ISO).getTime() - now.getTime()) / 36e5);
}
