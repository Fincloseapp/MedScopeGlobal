import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  return (
    process.env.DOKUMENTACE_INSTALL_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXTAUTH_SECRET ||
    "medscope-dokumentace-install"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Short-lived link binding phone install to a physician account. */
export function createDokumentaceInstallToken(
  userId: string,
  ttlMs = DEFAULT_TTL_MS
): string {
  const exp = Date.now() + ttlMs;
  const body = `${userId}.${exp}`;
  return `${body}.${sign(body)}`;
}

export function verifyDokumentaceInstallToken(
  token: string | null | undefined
): { ok: true; userId: string } | { ok: false; error: string } {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "Chybí odkaz propojení účtu." };
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "Neplatný odkaz propojení." };
  }
  const [userId, expRaw, sig] = parts;
  if (!userId || !expRaw || !sig) {
    return { ok: false, error: "Neplatný odkaz propojení." };
  }
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return { ok: false, error: "Odkaz propojení vypršel. Vygenerujte nový QR kód." };
  }
  const body = `${userId}.${expRaw}`;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "Neplatný podpis odkazu." };
    }
  } catch {
    return { ok: false, error: "Neplatný podpis odkazu." };
  }
  return { ok: true, userId };
}

export function dokumentaceAppUrl(opts?: {
  source?: string;
  link?: string;
  absolute?: boolean;
}): string {
  const path = "/app/mediktor";
  const params = new URLSearchParams();
  if (opts?.source) params.set("source", opts.source);
  if (opts?.link) params.set("link", opts.link);
  const qs = params.toString();
  const rel = qs ? `${path}?${qs}` : path;
  if (!opts?.absolute) return rel;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://medscopeglobal.com").replace(
    /\/$/,
    ""
  );
  return `${base}${rel}`;
}
