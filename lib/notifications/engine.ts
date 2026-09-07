import { sendEmail } from "@/lib/email/engine";
import { generateEmailContent } from "@/lib/email/ai-generator";
import { logAdminEvent } from "@/lib/logging";
import { getAccountEmailCopy } from "@/lib/i18n/account-email-copy";
import { resolveEmailLocale } from "@/lib/i18n/email-locale";
import { SITE } from "@/lib/config/site";

export type NotificationKind =
  | "new_article"
  | "new_study"
  | "new_test"
  | "subscription"
  | "doctor_alert"
  | "student_alert";

export interface NotificationPayload {
  kind: NotificationKind;
  recipient: string;
  title: string;
  body?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

function kindToEmailKind(kind: NotificationKind): "alert-doctor" | "alert-student" | "alert-public" | "transactional" {
  if (kind === "doctor_alert") return "alert-doctor";
  if (kind === "student_alert") return "alert-student";
  if (kind === "new_test") return "alert-student";
  return "alert-public";
}

function audienceForKind(kind: NotificationKind): "public" | "student" | "physician" | undefined {
  if (kind === "doctor_alert" || kind === "new_study") return "physician";
  if (kind === "student_alert" || kind === "new_test") return "student";
  return "public";
}

export async function dispatchNotification(payload: NotificationPayload) {
  const emailKind = kindToEmailKind(payload.kind);
  const generated = await generateEmailContent({
    kind: emailKind,
    audience: audienceForKind(payload.kind),
    subjectHint: payload.title,
    context: { body: payload.body, url: payload.url, ...payload.metadata },
  });

  const locale = resolveEmailLocale(String(payload.metadata?.locale ?? ""));
  const copy = getAccountEmailCopy(locale);
  const ctaLabel =
    typeof payload.metadata?.ctaLabel === "string" && payload.metadata.ctaLabel
      ? payload.metadata.ctaLabel
      : copy.openSite;
  const hint =
    typeof payload.metadata?.ctaHint === "string" && payload.metadata.ctaHint
      ? `<p>${payload.metadata.ctaHint}</p>`
      : "";
  const html = payload.url
    ? `${generated.html}${hint}<p><a href="${payload.url}">${ctaLabel}</a></p>`
    : generated.html;

  const category = payload.kind === "subscription" ? "transactional" : "system";

  const result = await sendEmail({
    to: payload.recipient,
    subject: payload.title || generated.subject,
    html,
    text: payload.body ?? generated.text,
    category,
    metadata: { notificationKind: payload.kind, ...payload.metadata },
  });

  await logAdminEvent("notification_dispatched", {
    kind: payload.kind,
    recipient: payload.recipient,
    ok: result.ok,
    provider: result.provider,
  });

  return result;
}

export async function notifyNewArticle(recipient: string, title: string, url: string) {
  return dispatchNotification({ kind: "new_article", recipient, title, url, body: `Nový článek: ${title}` });
}

export async function notifyNewStudy(recipient: string, title: string, url: string) {
  return dispatchNotification({ kind: "new_study", recipient, title, url, body: `Nová studie: ${title}` });
}

export async function notifySubscriptionConfirmed(
  recipient: string,
  planName: string,
  locale?: string | null,
  signInUrl?: string | null
) {
  const pack = getAccountEmailCopy(resolveEmailLocale(locale));
  const link = signInUrl?.trim();
  return dispatchNotification({
    kind: "subscription",
    recipient,
    title: pack.subscriptionSubject(planName),
    body: pack.subscriptionBody(planName),
    url: link || SITE.url,
    metadata: {
      locale: resolveEmailLocale(locale),
      ...(link
        ? { ctaLabel: pack.subscriptionSignInCta, ctaHint: pack.subscriptionSignInHint }
        : {}),
    },
  });
}
