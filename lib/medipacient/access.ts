import { getSessionProfile } from "@/lib/auth/session";
import { getLegalEntity } from "@/lib/config/legal-entity";
import {
  limitsForPlan,
  resolveMeDipacientPlan,
  type MeDipacientPlan,
  type MeDipacientPlanLimits,
} from "@/lib/medipacient/entitlement";
import { getVipStatus } from "@/lib/vip";
import { isGeminiConfigured } from "@/lib/ai/gemini-key";
import { isGroqConfigured } from "@/lib/ai/groq-client";
import { isOpenAiConfigured } from "@/lib/ai/openai-key";

export const MEDIPACIENT_LOGIN_NEXT = "/app/pacient";
export const MEDIPACIENT_LOGIN_URL = `/login?next=${encodeURIComponent(MEDIPACIENT_LOGIN_NEXT)}`;
export const MEDIPACIENT_TRIAL_URL = "/predplatne?trial=1";

export type MeDipacientAccessReason = "ok" | "unauthenticated" | "no_plan" | "unavailable";

export type MeDipacientAccess = {
  authenticated: boolean;
  entitled: boolean;
  owner: boolean;
  isVip: boolean;
  plan: MeDipacientPlan;
  limits: MeDipacientPlanLimits;
  reason: MeDipacientAccessReason;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  message: string;
  loginUrl: string;
  trialUrl: string;
  ocrReady: boolean;
};

/** Emails that always get MeDipacient (owner trial / admin). No passwords here. */
export function listMeDipacientOwnerEmails(): string[] {
  const legal = getLegalEntity();
  const fromEnv = (process.env.MEDIPACIENT_OWNER_EMAIL || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const extras = [
    process.env.LEGAL_CONTACT_EMAIL,
    process.env.ADMIN_NOTIFY_EMAIL,
    process.env.BOOTSTRAP_ADMIN_EMAIL,
    process.env.CONTACT_EMAIL,
    legal.legalEmail,
    legal.supportEmail,
    "admin@medscopeglobal.com",
    "info@medscopeglobal.com",
    "dawe.zegzul@seznam.cz",
  ]
    .map((s) => s?.trim().toLowerCase() ?? "")
    .filter(Boolean);
  return [...new Set([...fromEnv, ...extras])];
}

export function isMeDipacientOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return listMeDipacientOwnerEmails().includes(email.trim().toLowerCase());
}

function emptyAccess(
  partial: Omit<MeDipacientAccess, "plan" | "limits" | "loginUrl" | "trialUrl" | "ocrReady"> & {
    loginUrl?: string;
    trialUrl?: string;
  },
): MeDipacientAccess {
  const plan = resolveMeDipacientPlan({ owner: partial.owner, isVip: partial.isVip });
  return {
    ...partial,
    plan,
    limits: limitsForPlan(plan),
    loginUrl: partial.loginUrl || MEDIPACIENT_LOGIN_URL,
    trialUrl: partial.trialUrl || MEDIPACIENT_TRIAL_URL,
    ocrReady: isGeminiConfigured() || isOpenAiConfigured() || isGroqConfigured(),
  };
}

export async function getMeDipacientAccess(): Promise<MeDipacientAccess> {
  const loginUrl = MEDIPACIENT_LOGIN_URL;
  const trialUrl = MEDIPACIENT_TRIAL_URL;

  try {
    const session = await getSessionProfile();
    const user = session.user;
    const profile = session.profile;

    if (!user) {
      return emptyAccess({
        authenticated: false,
        entitled: false,
        owner: false,
        isVip: false,
        reason: "unauthenticated",
        userId: null,
        email: null,
        displayName: null,
        role: null,
        message: "Přihlaste se stejným účtem MedScopeGlobal — pak MeDipacient funguje v prohlížeči i v telefonu.",
        loginUrl,
        trialUrl,
      });
    }

    const owner = isMeDipacientOwnerEmail(user.email) || profile?.role === "admin";
    const isVip = await getVipStatus(user.id);
    const paid = owner || isVip;

    return emptyAccess({
      authenticated: true,
      entitled: true,
      owner,
      isVip,
      reason: paid ? "ok" : "no_plan",
      userId: user.id,
      email: user.email ?? null,
      displayName: profile?.full_name ?? null,
      role: profile?.role ?? null,
      message: owner
        ? "Vlastnický / trial účet — plný přístup k MeDipacient."
        : paid
          ? "Účet s trialem nebo předplatným — MeDipacient Medium je odemčený."
          : "Tarif Zdarma: až 20 zpráv, text, kontrola a doporučení. Medium odemkne osu, grafy a připomínky.",
      loginUrl,
      trialUrl,
    });
  } catch {
    return emptyAccess({
      authenticated: false,
      entitled: false,
      owner: false,
      isVip: false,
      reason: "unavailable",
      userId: null,
      email: null,
      displayName: null,
      role: null,
      message: "Nepodařilo se ověřit relaci. Zkuste to znovu.",
      loginUrl,
      trialUrl,
    });
  }
}
