export const EDITORIAL_PAID_COOKIE = "ms_editorial_paid";

const MAX_MS = 400 * 86_400_000;

export function isEditorialCookieValid(value?: string | null): boolean {
  if (!value) return false;
  const end = Number(value);
  if (!Number.isFinite(end)) return false;
  const now = Date.now();
  return end > now && end - now < MAX_MS;
}

export function editorialCookieMaxAgeSec(periodEndMs: number): number {
  return Math.max(60, Math.min(Math.floor(MAX_MS / 1000), Math.floor((periodEndMs - Date.now()) / 1000)));
}
