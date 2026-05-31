import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { PortalUser, SessionUser } from "./types";

export const sessionCookieName = "medscope_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function secret() {
  return process.env.AUTH_SECRET || process.env.ARTICLE_ACCESS_SECRET || "medscopeglobal-portal-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, hash] = passwordHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return safeEqual(candidate, hash);
}

export function toSessionUser(user: PortalUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    verificationStatus: user.verificationStatus,
    institution: user.institution
  };
}

export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + SESSION_TTL_MS }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(value: string | undefined | null): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp?: number };
    if (!parsed.id || !parsed.email || !parsed.role) return null;
    if (typeof parsed.exp === "number" && parsed.exp < Date.now()) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      verificationStatus: parsed.verificationStatus,
      institution: parsed.institution
    };
  } catch {
    return null;
  }
}

export function createUserId(): string {
  return `usr_${randomBytes(8).toString("hex")}`;
}

export function createArticleId(): string {
  return `art_${randomBytes(8).toString("hex")}`;
}
