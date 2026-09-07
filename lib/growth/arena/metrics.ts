export type ConversionWindow = {
  visits: number;
  checkouts: number;
  paid: number;
  newsletters: number;
};

/**
 * Estimated K-factor from referred conversions in a short window.
 * K = (paid + 0.4·checkout + 0.15·newsletter) / max(visits, 1) × 10
 * 1.5 means unusually strong conversion, not invented reach.
 */
export function estimateKFactor(window: ConversionWindow): number {
  const visits = Math.max(0, window.visits);
  const conversions =
    Math.max(0, window.paid) +
    Math.max(0, window.checkouts) * 0.4 +
    Math.max(0, window.newsletters) * 0.15;
  if (visits <= 0) return conversions > 0 ? conversions : 0;
  return Math.round((conversions / visits) * 10 * 1000) / 1000;
}

export function ctrOf(window: ConversionWindow): number {
  if (window.visits <= 0) return 0;
  return Math.round((window.checkouts / window.visits) * 1000) / 1000;
}

const SPAM_RE =
  /buy now!!!|crypto pump|unsolicited bulk|blast\s*\d{3,}|fake review|shadowban bypass|follow.?back farm|mass dm/i;

export function looksLikeSpam(text?: string | null): boolean {
  const raw = String(text ?? "");
  if (!raw.trim()) return false;
  if (SPAM_RE.test(raw)) return true;
  const links = raw.match(/https?:\/\//gi) ?? [];
  if (links.length > 8) return true;
  if (/(.)\1{9,}/.test(raw)) return true;
  return false;
}

export function analystAccuracy(predicted: number | null | undefined, actual: number): number {
  if (predicted == null || Number.isNaN(predicted)) return 0;
  const err = Math.abs(predicted - actual);
  return Math.max(0, Math.round((100 - err * 40) * 10) / 10);
}
