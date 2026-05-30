import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import type { AnalyticsPayload } from "./analytics";
import type { ContactSubmission, EventSubmission } from "./contact";
import { logger } from "./logger";

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient | null; prismaPool?: Pool };

const PLACEHOLDER_PATTERN = /\[(PASSWORD|REF|HESLO)\]/i;

function roleToDb(role?: string) {
  return role ? role.toUpperCase() : undefined;
}

function formatToDb(format: string) {
  return format === "in-person" ? "IN_PERSON" : format.toUpperCase();
}

export function hasPlaceholderConnectionString(value?: string) {
  return Boolean(value && PLACEHOLDER_PATTERN.test(value));
}

export function getDatabaseConfigurationIssue(): string | null {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (!databaseUrl && !directUrl) {
    return "DATABASE_URL a DIRECT_URL nejsou nastaveny ve Vercel.";
  }
  if (hasPlaceholderConnectionString(databaseUrl) || hasPlaceholderConnectionString(directUrl)) {
    return "Connection string obsahuje placeholder [PASSWORD] – nahraďte skutečným heslem ze Supabase dashboardu.";
  }
  return null;
}

function shouldUseSsl(connectionString: string) {
  if (/sslmode=(require|verify-full|verify-ca)/i.test(connectionString)) return { rejectUnauthorized: false };
  if (connectionString.includes("supabase.com") || process.env.VERCEL === "1") return { rejectUnauthorized: false };
  return undefined;
}

function resolveConnectionString(): string | null {
  const configIssue = getDatabaseConfigurationIssue();
  if (configIssue) return null;

  const direct = process.env.DIRECT_URL;
  const pooled = process.env.DATABASE_URL;

  // On Vercel, direct connection is more reliable with node-postgres than transaction pooler (6543).
  if (process.env.VERCEL === "1" && direct) return direct;
  if (pooled) return pooled;
  return direct ?? null;
}

function createPrismaClient(): PrismaClient | null {
  const connectionString = resolveConnectionString();
  if (!connectionString) return null;

  try {
    const globalForPrisma = globalThis as GlobalWithPrisma;
    globalForPrisma.prismaPool ??= new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
      ssl: shouldUseSsl(connectionString)
    });

    const adapter = new PrismaPg(globalForPrisma.prismaPool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
    });
  } catch (error) {
    logger.error("prisma_client_init_failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

export function getPrisma() {
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) return null;
  if (getDatabaseConfigurationIssue()) return null;
  const globalForPrisma = globalThis as GlobalWithPrisma;
  if (globalForPrisma.prisma === undefined) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export async function persistContactSubmission(kind: "general" | "partner", targetEmail: string, submission: ContactSubmission) {
  const prisma = getPrisma(); if (!prisma) return;
  try { await prisma.contactSubmission.create({ data: { name: submission.name, email: submission.email, organization: submission.organization, role: roleToDb(submission.role) as never, topic: submission.topic, message: submission.message, targetEmail, leadSource: submission.leadSource, leadQuality: kind === "partner" ? "high-value" : "standard" } }); }
  catch (error) { logger.error("persist_contact_submission_failed", { error: error instanceof Error ? error.message : String(error) }); }
}
export async function persistEventSubmission(submission: EventSubmission) {
  const prisma = getPrisma(); if (!prisma) return;
  try { await prisma.eventSubmission.create({ data: { title: submission.title, description: submission.description, region: submission.region, format: formatToDb(submission.format) as never, specialization: submission.specialization, startsAt: new Date(submission.startsAt), endsAt: new Date(submission.endsAt), organizer: submission.organizer, contactEmail: submission.contactEmail } }); }
  catch (error) { logger.error("persist_event_submission_failed", { error: error instanceof Error ? error.message : String(error) }); }
}
export async function persistUserPreferences(payload: { email: string; name?: string; role: string; preferences: Record<string, unknown> }) {
  const prisma = getPrisma(); if (!prisma) return;
  try { await prisma.user.upsert({ where: { email: payload.email }, update: { name: payload.name, role: roleToDb(payload.role) as never, preferences: payload.preferences as never }, create: { email: payload.email, name: payload.name, role: roleToDb(payload.role) as never, preferences: payload.preferences as never } }); }
  catch (error) { logger.error("persist_user_preferences_failed", { error: error instanceof Error ? error.message : String(error) }); }
}
export async function persistAnalyticsEvent(payload: AnalyticsPayload) {
  const prisma = getPrisma(); if (!prisma) return;
  try { await prisma.analyticsEvent.create({ data: { name: payload.name, role: roleToDb(payload.role) as never, segment: payload.segment, source: payload.source, value: payload.value as never } }); }
  catch (error) { logger.error("persist_analytics_event_failed", { error: error instanceof Error ? error.message : String(error) }); }
}
