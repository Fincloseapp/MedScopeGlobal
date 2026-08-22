import { createHash, randomInt, timingSafeEqual } from "crypto";
import { sendEmail } from "@/lib/email/engine";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 45_000;

export type OtpChannel = "email" | "sms";

export type NormalizedIdentifier =
  | { kind: "email"; email: string; phone?: string }
  | { kind: "phone"; phone: string; email?: string }
  | { kind: "invalid"; message: string }
  | { kind: "email_required"; phone: string; message: string };

function pepper(): string {
  return (
    process.env.MEDIKTOR_OTP_PEPPER?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32) ||
    "mediktor-otp-dev-pepper"
  );
}

export function hashOtpCode(code: string, destinationNorm: string): string {
  return createHash("sha256")
    .update(`${pepper()}:${destinationNorm}:${code}`)
    .digest("hex");
}

export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "").trim();
  if (!digits) return null;
  let e164 = digits;
  if (e164.startsWith("00")) e164 = `+${e164.slice(2)}`;
  if (/^(\d{9})$/.test(e164)) e164 = `+420${e164}`;
  if (/^420\d{9}$/.test(e164)) e164 = `+${e164}`;
  if (!/^\+\d{10,15}$/.test(e164)) return null;
  return e164;
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return null;
  return email;
}

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim()
  );
}

/** Parse phone and/or email from onboarding form. Prefer email when SMS unavailable. */
export function normalizeIdentifier(input: {
  email?: string | null;
  phone?: string | null;
}): NormalizedIdentifier {
  const email = input.email ? normalizeEmail(input.email) : null;
  const phone = input.phone ? normalizePhone(input.phone) : null;

  if (!email && !phone) {
    return {
      kind: "invalid",
      message: "Zadejte e‑mail (kód pošleme e‑mailem). Telefon je volitelný.",
    };
  }

  if (phone && !email && !isSmsConfigured()) {
    return {
      kind: "email_required",
      phone,
      message:
        "SMS zatím není zapnutá. Doplňte e‑mail — kód pošleme e‑mailem. Telefon si uložíme k účtu po ověření.",
    };
  }

  if (email) {
    return { kind: "email", email, phone: phone ?? undefined };
  }

  return { kind: "phone", phone: phone!, email: email ?? undefined };
}

async function sendSmsStub(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSmsConfigured()) {
    return { ok: false, error: "SMS provider not configured" };
  }
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
    const token = process.env.TWILIO_AUTH_TOKEN!.trim();
    const from = process.env.TWILIO_FROM_NUMBER!.trim();
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `MeDiktor: váš ověřovací kód je ${code}. Platí 10 minut.`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!res.ok) {
      return { ok: false, error: `Twilio ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "SMS failed" };
  }
}

export async function createAndSendOtp(opts: {
  email?: string | null;
  phone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  product?: "mediktor" | "mediprep";
}): Promise<
  | {
      ok: true;
      channel: OtpChannel;
      destinationMasked: string;
      challengeId: string;
      expiresInSec: number;
      debugCode?: string;
      smsGap?: boolean;
    }
  | { ok: false; status: number; error: string; code?: string; phone?: string }
> {
  const ident = normalizeIdentifier({ email: opts.email, phone: opts.phone });
  if (ident.kind === "invalid") {
    return { ok: false, status: 400, error: ident.message };
  }
  if (ident.kind === "email_required") {
    return {
      ok: false,
      status: 422,
      error: ident.message,
      code: "EMAIL_REQUIRED_FOR_OTP",
      phone: ident.phone,
    };
  }

  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, status: 503, error: "Služba dočasně nedostupná." };
  }

  const channel: OtpChannel = ident.kind === "email" ? "email" : "sms";
  const destination = ident.kind === "email" ? ident.email : ident.phone;
  const destinationNorm = destination;
  const phone = ident.phone;

  const { data: recent } = await admin
    .from("mediktor_otp_challenges")
    .select("created_at")
    .eq("destination_norm", destinationNorm)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.created_at) {
    const age = Date.now() - new Date(recent.created_at as string).getTime();
    if (age < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        status: 429,
        error: "Počkejte chvíli před dalším odesláním kódu.",
        code: "OTP_COOLDOWN",
      };
    }
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code, destinationNorm);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { data: row, error } = await admin
    .from("mediktor_otp_challenges")
    .insert({
      channel,
      destination,
      destination_norm: destinationNorm,
      code_hash: codeHash,
      expires_at: expiresAt,
      ip: opts.ip ?? null,
      user_agent: opts.userAgent?.slice(0, 300) ?? null,
      metadata: { phone: phone ?? null, product: opts.product ?? "mediktor" },
    })
    .select("id")
    .single();

  if (error || !row) {
    // Table may not exist yet — fall back to in-memory style debug path is not safe in prod.
    return {
      ok: false,
      status: 503,
      error:
        "OTP úložiště není připravené. Spusťte migraci mediktor_onboarding.",
      code: "OTP_STORE_MISSING",
    };
  }

  if (channel === "email") {
    const brand = opts.product === "mediprep" ? "MeDiprep" : "MeDiktor";
    const mail = await sendEmail({
      to: destination,
      subject: `${brand} — ověřovací kód`,
      category: "transactional",
      html: `<p>Váš ověřovací kód pro ${brand} od MedScopeGlobal:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>Kód platí 10 minut. Pokud jste o něj nežádali, e-mail ignorujte.</p><p>MedScopeGlobal · +420 733 635 144</p>`,
      text: `${brand} ověřovací kód: ${code}\nPlatí 10 minut.\nMedScopeGlobal · +420 733 635 144`,
    });
    if (!mail.ok) {
      const debug =
        process.env.MEDIKTOR_OTP_DEBUG === "1" ||
        process.env.NODE_ENV === "development";
      if (!debug) {
        await admin.from("mediktor_otp_challenges").delete().eq("id", row.id);
        const noProvider =
          mail.provider === "none" || /no email provider/i.test(mail.error || "");
        return {
          ok: false,
          status: 502,
          error: noProvider
            ? "E-mail odesílání není připravené. Zkuste to za chvíli, nebo volejte +420 733 635 144."
            : "Nepodařilo se odeslat e-mail s kódem. Zkuste to znovu.",
          code: noProvider ? "EMAIL_PROVIDER_MISSING" : "EMAIL_SEND_FAILED",
        };
      }
    }
  } else {
    const sms = await sendSmsStub(destination, code);
    if (!sms.ok) {
      await admin.from("mediktor_otp_challenges").delete().eq("id", row.id);
      return {
        ok: false,
        status: 502,
        error: "Nepodařilo se odeslat SMS. Zadejte e-mail pro kód.",
        code: "SMS_SEND_FAILED",
      };
    }
  }

  const masked =
    channel === "email"
      ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
      : destination.replace(/^(\+\d{3})\d+(\d{3})$/, "$1***$2");

  const debug =
    process.env.MEDIKTOR_OTP_DEBUG === "1" ||
    process.env.NODE_ENV === "development";

  return {
    ok: true,
    channel,
    destinationMasked: masked,
    challengeId: row.id as string,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    debugCode: debug ? code : undefined,
    smsGap: channel === "email" && Boolean(phone) && !isSmsConfigured(),
  };
}

export async function verifyOtpChallenge(opts: {
  challengeId: string;
  code: string;
}): Promise<
  | {
      ok: true;
      channel: OtpChannel;
      destination: string;
      phone?: string | null;
    }
  | { ok: false; status: number; error: string; code?: string }
> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return { ok: false, status: 503, error: "Služba dočasně nedostupná." };
  }

  const code = opts.code.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, status: 400, error: "Zadejte 6místný kód." };
  }

  const { data: row, error } = await admin
    .from("mediktor_otp_challenges")
    .select("*")
    .eq("id", opts.challengeId)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, status: 404, error: "Kód vypršel nebo neexistuje." };
  }

  if (row.consumed_at) {
    return { ok: false, status: 410, error: "Kód už byl použit." };
  }

  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    return { ok: false, status: 410, error: "Kód vypršel. Požádejte o nový." };
  }

  if ((row.attempts as number) >= (row.max_attempts as number)) {
    return { ok: false, status: 429, error: "Příliš mnoho pokusů. Požádejte o nový kód." };
  }

  const expected = row.code_hash as string;
  const actual = hashOtpCode(code, row.destination_norm as string);
  const ok =
    expected.length === actual.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(actual));

  await admin
    .from("mediktor_otp_challenges")
    .update({
      attempts: (row.attempts as number) + 1,
      consumed_at: ok ? new Date().toISOString() : null,
    })
    .eq("id", opts.challengeId);

  if (!ok) {
    return { ok: false, status: 401, error: "Neplatný kód." };
  }

  const meta = (row.metadata ?? {}) as { phone?: string | null };
  return {
    ok: true,
    channel: row.channel as OtpChannel,
    destination: row.destination as string,
    phone: meta.phone ?? (row.channel === "sms" ? (row.destination as string) : null),
  };
}
