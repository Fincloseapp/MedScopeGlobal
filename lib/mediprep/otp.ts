import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { sendEmail } from "@/lib/email/engine";
import { MEDIPREP } from "@/lib/apps/catalog";

type OtpRecord = { hash: string; exp: number; email: string };

const memory = new Map<string, OtpRecord>();
const TTL_MS = 10 * 60 * 1000;

function secret() {
  return (
    process.env.MEDIPREP_OTP_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "mediprep-otp-dev"
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  return createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");
}

export async function requestPrepOtp(emailRaw: string): Promise<{
  ok: boolean;
  message: string;
  devCode?: string;
}> {
  const email = normalizeEmail(emailRaw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Zadejte platný e-mail." };
  }
  const code = String(randomInt(100000, 999999));
  memory.set(email, { hash: hashCode(email, code), exp: Date.now() + TTL_MS, email });

  const sent = await sendEmail({
    to: email,
    subject: `Kód do ${MEDIPREP.shortName}: ${code}`,
    category: "transactional",
    text: `Váš kód do ${MEDIPREP.shortName} je ${code}. Platí 10 minut. Pokud jste o kód nežádali, e-mail ignorujte.`,
    html: `<p>Váš kód do <strong>${MEDIPREP.shortName}</strong> je <strong>${code}</strong>.</p><p>Platí 10 minut. medscopeglobal.com</p>`,
  });

  if (sent.ok) {
    return { ok: true, message: `Kód jsme poslali na ${email}.` };
  }

  const allowDev = process.env.NODE_ENV !== "production";
  return {
    ok: true,
    message: allowDev
      ? `E-mail se nepodařilo odeslat — vývojový kód: ${code}`
      : `Kód je připraven. Pokud e-mail nedorazí, použijte přihlášení účtem MedScopeGlobal.`,
    devCode: allowDev ? code : undefined,
  };
}

export function verifyPrepOtp(emailRaw: string, codeRaw: string): { ok: true; email: string } | { ok: false; message: string } {
  const email = normalizeEmail(emailRaw);
  const code = codeRaw.trim();
  const rec = memory.get(email);
  if (!rec) return { ok: false, message: "Nejdřív si nechte poslat kód." };
  if (rec.exp < Date.now()) {
    memory.delete(email);
    return { ok: false, message: "Kód vypršel. Požádejte o nový." };
  }
  const expected = Buffer.from(rec.hash);
  const got = Buffer.from(hashCode(email, code));
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    return { ok: false, message: "Neplatný kód." };
  }
  memory.delete(email);
  return { ok: true, email };
}
