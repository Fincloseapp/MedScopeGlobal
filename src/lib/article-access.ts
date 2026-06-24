import { createHmac, timingSafeEqual } from "node:crypto";
import type { Article, Role } from "./types";

export const articleAccessCookieName = "medscope_profile";

export interface ArticleAccessProfile {
  email: string;
  name?: string;
  role: Role;
  newsletter: boolean;
  preferences: Record<string, unknown>;
  issuedAt: number;
}

export interface ArticleAccessState {
  hasFullAccess: boolean;
  requiresSubscription: boolean;
  accessLabel: string;
  message: string;
  eligibleRoles: Role[];
}

const eligibleRolesByAudience: Record<Article["audience"], Role[]> = {
  "laik-student": ["student", "doctor", "scientist", "partner"],
  clinician: ["doctor", "scientist"],
  researcher: ["scientist", "doctor"],
  partner: ["partner"]
};

const roleLabels: Record<Role, string> = {
  doctor: "lékař",
  student: "student / veřejný návštěvník",
  scientist: "vědec",
  partner: "partner"
};

function secret() {
  return process.env.ARTICLE_ACCESS_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "medscopeglobal-local-access-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createArticleAccessCookieValue(profile: Omit<ArticleAccessProfile, "issuedAt"> & { issuedAt?: number }) {
  const payload = Buffer.from(JSON.stringify({ ...profile, issuedAt: profile.issuedAt ?? Date.now() }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readArticleAccessCookie(value: string | undefined): ArticleAccessProfile | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ArticleAccessProfile;
    if (!parsed.email || !parsed.role || typeof parsed.newsletter !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function resolveArticleAccess(article: Article, profile: ArticleAccessProfile | null | undefined): ArticleAccessState {
  const eligibleRoles = eligibleRolesByAudience[article.audience];
  const isPublic = article.audience === "laik-student";
  const hasSubscribedRole = Boolean(profile?.newsletter && eligibleRoles.includes(profile.role));

  if (isPublic) {
    return {
      hasFullAccess: true,
      requiresSubscription: false,
      accessLabel: "Volně dostupné",
      message: "Článek je dostupný všem návštěvníkům v úrovni veřejnost / student.",
      eligibleRoles
    };
  }

  if (hasSubscribedRole) {
    return {
      hasFullAccess: true,
      requiresSubscription: true,
      accessLabel: "Odemčeno newsletterem",
      message: "Odborný článek je odemčený pro vaši roli a aktivní newsletter.",
      eligibleRoles
    };
  }

  return {
    hasFullAccess: false,
    requiresSubscription: true,
    accessLabel: "Odborná úroveň",
    message: `Plný text je dostupný po uložení profilu s newsletterem pro roli ${eligibleRoles.map((role) => roleLabels[role]).join(" / ")}.`,
    eligibleRoles
  };
}

export function publicExcerpt(content: string) {
  const [firstSentence] = content.split(/(?<=[.!?])\s+/);
  return firstSentence || content.slice(0, 220);
}
