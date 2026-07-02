import { deliverWeeklyDigest } from "@/lib/academy/marketing/digest-delivery";
import { generateWeeklyDigest } from "@/lib/academy/marketing/weekly-digest";
import { generateEmailContent } from "@/lib/email/ai-generator";
import { sendEmail } from "@/lib/email/engine";
import { logAdminEvent } from "@/lib/logging";

export type NewsletterSegment = "public" | "students" | "doctors";

export interface NewsletterSendResult {
  segment: NewsletterSegment;
  sent: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  stub?: boolean;
}

function segmentAudience(segment: NewsletterSegment): "public" | "student" | "physician" {
  if (segment === "students") return "student";
  if (segment === "doctors") return "physician";
  return "public";
}

function segmentListEnv(segment: NewsletterSegment): string | undefined {
  if (segment === "students") return process.env.NEWSLETTER_STUDENTS_LIST?.trim();
  if (segment === "doctors") return process.env.NEWSLETTER_DOCTORS_LIST?.trim();
  return process.env.NEWSLETTER_PUBLIC_LIST?.trim();
}

function segmentFallbackTo(segment: NewsletterSegment): string | undefined {
  if (segment === "students") return process.env.NEWSLETTER_STUDENTS_TO?.trim();
  if (segment === "doctors") return process.env.NEWSLETTER_DOCTORS_TO?.trim();
  return process.env.NEWSLETTER_PUBLIC_TO?.trim();
}

/** AI newsletter per segment — integrates academy digest for student/doctor overlap. */
export async function sendAiNewsletter(
  segment: NewsletterSegment,
  options?: { useAcademyDigest?: boolean; eventId?: string }
): Promise<NewsletterSendResult> {
  const eventId = options?.eventId ?? `newsletter-${segment}-${Date.now()}`;
  const audience = segmentAudience(segment);

  if (options?.useAcademyDigest && (segment === "students" || segment === "doctors")) {
    const digest = await generateWeeklyDigest();
    const delivery = await deliverWeeklyDigest(digest, eventId);
    await logAdminEvent("ai_newsletter_academy_digest", { segment, eventId, delivery });
    return {
      segment,
      sent: delivery.sent,
      provider: delivery.mode,
      messageId: delivery.messageId,
      error: delivery.error,
    };
  }

  const content = await generateEmailContent({
    kind: "newsletter",
    audience,
    context: { segment, eventId },
  });

  const to = segmentFallbackTo(segment) ?? process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!to) {
    await logAdminEvent("ai_newsletter_skipped", { segment, reason: "no recipient" });
    return { segment, sent: false, provider: "none", error: "No recipient configured", stub: content.stub };
  }

  const result = await sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    category: "marketing",
    metadata: { segment, eventId, listId: segmentListEnv(segment), stub: content.stub },
  });

  await logAdminEvent("ai_newsletter_sent", {
    segment,
    eventId,
    ok: result.ok,
    provider: result.provider,
    fallbackUsed: result.fallbackUsed,
  });

  return {
    segment,
    sent: result.ok,
    provider: result.provider,
    messageId: result.messageId,
    error: result.error,
    stub: content.stub,
  };
}

export async function sendAllSegmentNewsletters(): Promise<NewsletterSendResult[]> {
  const segments: NewsletterSegment[] = ["public", "students", "doctors"];
  const results: NewsletterSendResult[] = [];
  for (const segment of segments) {
    results.push(
      await sendAiNewsletter(segment, {
        useAcademyDigest: segment !== "public",
        eventId: `bulk-${segment}-${Date.now()}`,
      })
    );
  }
  return results;
}
