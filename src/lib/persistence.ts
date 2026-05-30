import { PrismaClient } from "@prisma/client";
import type { AnalyticsPayload } from "./analytics";
import type { ContactSubmission, EventSubmission } from "./contact";
import { logger } from "./logger";

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

function roleToDb(role?: string) {
  return role ? role.toUpperCase() : undefined;
}

function formatToDb(format: string) {
  return format === "in-person" ? "IN_PERSON" : format.toUpperCase();
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const globalForPrisma = globalThis as GlobalWithPrisma;
  globalForPrisma.prisma ??= new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
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
