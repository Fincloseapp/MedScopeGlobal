/** Academy runtime settings — read from env (no secrets). */

export function isExpertReviewAutoPublishEnabled(): boolean {
  const raw = process.env.ACADEMY_EXPERT_REVIEW_AUTO_PUBLISH?.trim().toLowerCase();
  if (!raw) return true;
  return raw === "1" || raw === "true" || raw === "yes";
}

export function getVideoWebhookUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "https://medscopeglobal.com";
  return `${site.replace(/\/$/, "")}/api/academy/video/webhook`;
}
