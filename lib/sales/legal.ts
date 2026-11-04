import { runAdEditorBoard } from "@/lib/ads/ad-editors";
import { hostnameFromWebsite } from "@/lib/sales/icp";
import type { SalesLegalBasis, SalesProspect } from "@/lib/sales/types";

const PERSONAL_MAILBOX = /@(gmail|googlemail|seznam|email\.cz|outlook|hotmail|icloud|yahoo|protonmail|zoznam)\./i;

const ROLE_LOCAL_PART =
  /^(info|marketing|obchod|sales|inzerce|reklama|media|pr|press|tisk|partnerstvi|partnerství|kontakt|office|hello|advertising)@/i;

const MAX_TOUCHES_DEFAULT = 3;
const MIN_DAYS_BETWEEN = 7;

export function salesMaxTouches(): number {
  const n = Number(process.env.SALES_MAX_TOUCHES ?? MAX_TOUCHES_DEFAULT);
  return Number.isFinite(n) && n > 0 ? Math.min(6, Math.floor(n)) : MAX_TOUCHES_DEFAULT;
}

export function salesMaxEmailsPerRun(): number {
  const n = Number(process.env.SALES_MAX_EMAILS_PER_RUN ?? 12);
  return Number.isFinite(n) && n > 0 ? Math.min(40, Math.floor(n)) : 12;
}

/** Cold B2B auto-send is off unless operators explicitly enable it. */
export function salesColdAutoSendEnabled(): boolean {
  return /^(1|true|yes)$/i.test(process.env.SALES_AUTO_OUTBOUND ?? "");
}

export function isPersonalMailbox(email: string | null | undefined): boolean {
  if (!email) return true;
  return PERSONAL_MAILBOX.test(email);
}

export function isRoleBasedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ROLE_LOCAL_PART.test(email.trim());
}

export function normalizeSalesEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

export type OutreachGate = {
  allow: boolean;
  autoSend: boolean;
  reason: string;
  legalBasis: SalesLegalBasis;
};

export function evaluateOutreachGate(input: {
  email: string | null;
  legalBasis: SalesLegalBasis;
  stage: SalesProspect["stage"];
  outreachCount: number;
  lastContactedAt: string | null;
  suppressedAt: string | null;
  approvedOutreachAt: string | null;
  now?: Date;
  suppressed?: boolean;
}): OutreachGate {
  const now = input.now ?? new Date();
  const basis = input.legalBasis;

  if (input.suppressedAt || input.suppressed) {
    return { allow: false, autoSend: false, reason: "suppressed", legalBasis: basis };
  }
  if (input.stage === "lost" || input.stage === "suppressed" || input.stage === "paused") {
    return { allow: false, autoSend: false, reason: `stage_${input.stage}`, legalBasis: basis };
  }
  if (!input.email) {
    return { allow: false, autoSend: false, reason: "missing_email", legalBasis: basis };
  }
  if (basis === "none" || basis === "unverified_guess") {
    return { allow: false, autoSend: false, reason: "no_legal_basis", legalBasis: basis };
  }
  if (input.outreachCount >= salesMaxTouches()) {
    return { allow: false, autoSend: false, reason: "max_touches", legalBasis: basis };
  }
  if (input.lastContactedAt) {
    const last = new Date(input.lastContactedAt).getTime();
    const delta = now.getTime() - last;
    if (Number.isFinite(last) && delta < MIN_DAYS_BETWEEN * 24 * 60 * 60 * 1000) {
      return { allow: false, autoSend: false, reason: "too_soon", legalBasis: basis };
    }
  }

  const inbound = basis === "inquiry" || basis === "consent" || basis === "customer";
  if (inbound) {
    return { allow: true, autoSend: true, reason: "inbound_or_customer", legalBasis: basis };
  }

  if (basis === "legitimate_interest") {
    if (isPersonalMailbox(input.email)) {
      return { allow: false, autoSend: false, reason: "personal_mailbox", legalBasis: basis };
    }
    if (!isRoleBasedEmail(input.email)) {
      return {
        allow: true,
        autoSend: false,
        reason: "needs_approval_non_role_email",
        legalBasis: basis,
      };
    }
    if (input.approvedOutreachAt || salesColdAutoSendEnabled()) {
      return { allow: true, autoSend: true, reason: "b2b_legitimate_interest", legalBasis: basis };
    }
    return {
      allow: true,
      autoSend: false,
      reason: "needs_approval_cold",
      legalBasis: basis,
    };
  }

  return { allow: false, autoSend: false, reason: "blocked", legalBasis: basis };
}

export function creativeCompliance(input: {
  company: string;
  offerText?: string | null;
  targetUrl?: string | null;
  creativeUrl?: string | null;
}) {
  return runAdEditorBoard({
    company: input.company,
    adText: input.offerText,
    targetUrl: input.targetUrl,
    bannerUrl: input.creativeUrl,
  });
}

export function unsubscribeToken(email: string, secret?: string): string {
  const key = secret || process.env.CRON_SECRET || process.env.ADMIN_GATE_PASSWORD || "medscope-sales";
  const material = `${email.trim().toLowerCase()}::${key}`;
  let hash = 0;
  for (let i = 0; i < material.length; i += 1) {
    hash = (hash * 33 + material.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function verifyUnsubscribeToken(email: string, token: string, secret?: string): boolean {
  return unsubscribeToken(email, secret) === token;
}

export function domainMatchesWebsite(email: string, website: string | null): boolean {
  const host = hostnameFromWebsite(website);
  if (!host) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return domain === host || domain.endsWith(`.${host}`) || host.endsWith(`.${domain}`);
}
