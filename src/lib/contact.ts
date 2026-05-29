import { z } from "zod";
import { logger } from "./logger";
import { sanitizeText } from "./security";
import { siteConfig } from "./site";

const roleSchema = z.enum(["doctor", "student", "scientist", "partner"]);
export const contactSubmissionSchema = z.object({
  name: z.string().min(2).max(120).transform(sanitizeText),
  email: z.string().email().max(180).transform((value) => value.toLowerCase()),
  organization: z.string().max(160).optional().transform((value) => (value ? sanitizeText(value) : value)),
  role: roleSchema.optional(),
  topic: z.string().min(2).max(120).default("Kontakt").transform(sanitizeText),
  message: z.string().min(10).max(4_000).transform(sanitizeText),
  leadSource: z.string().max(120).optional().transform((value) => (value ? sanitizeText(value) : value)),
  website: z.literal("").optional()
});
export const eventSubmissionSchema = z.object({
  title: z.string().min(4).max(180).transform(sanitizeText),
  description: z.string().min(20).max(4_000).transform(sanitizeText),
  region: z.string().min(2).max(80).transform(sanitizeText),
  format: z.enum(["online", "hybrid", "in-person"]),
  specialization: z.string().min(2).max(120).transform(sanitizeText),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  organizer: z.string().min(2).max(160).transform(sanitizeText),
  contactEmail: z.string().email().max(180).transform((value) => value.toLowerCase()),
  website: z.literal("").optional()
}).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), { message: "Konec události musí být po začátku.", path: ["endsAt"] });
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type EventSubmission = z.infer<typeof eventSubmissionSchema>;
export function resolveTargetEmail(kind: "general" | "partner") { return kind === "partner" ? siteConfig.adsEmail : siteConfig.contactEmail; }
export async function sendContactEmail(kind: "general" | "partner", submission: ContactSubmission) {
  const targetEmail = resolveTargetEmail(kind);
  const payload = { to: targetEmail, subject: `[MedScopeGlobal] ${submission.topic}`, submission: { ...submission, website: undefined } };
  if (process.env.EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Email webhook failed with ${response.status}`);
  }
  logger.info("contact_submission_routed", { kind, targetEmail, email: submission.email, role: submission.role, leadSource: submission.leadSource });
  return { targetEmail };
}
