import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { applyNewsletterSubscriberSchema } from "@/lib/monetization/apply-schema";
import { sendEmail } from "@/lib/email/engine";
import { SITE } from "@/lib/config/site";

export type RevenueOpsResult = {
  ok: boolean;
  schema: { ok: boolean; skipped?: boolean; error?: string };
  promoted: number;
  notified: number;
  errors: string[];
  timestamp: string;
};

function adminInbox(): string {
  return (
    process.env.ADMIN_NOTIFY_EMAIL?.trim() ||
    process.env.NEWSLETTER_PUBLIC_TO?.trim() ||
    "info@medscopeglobal.com"
  );
}

type FallbackRow = {
  id: string;
  payload: {
    email?: string;
    locale?: string;
    segment?: string;
    source?: string;
    pending_table?: boolean;
    promoted?: boolean;
  } | null;
};

export async function promoteAnalyticsNewsletterSignups(limit = 200): Promise<{
  promoted: number;
  errors: string[];
}> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return { promoted: 0, errors: ["no_service_role"] };

  const { data, error } = await admin
    .from("analytics")
    .select("id, payload")
    .eq("event", "newsletter_subscribe")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return { promoted: 0, errors: [error.message] };

  let promoted = 0;
  const errors: string[] = [];
  for (const row of (data ?? []) as FallbackRow[]) {
    const payload = row.payload ?? {};
    if (payload.promoted) continue;
    const email = String(payload.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) continue;

    const segment = payload.segment === "doctors" ? "doctors" : "public";
    const { error: insertError } = await admin.from("newsletter_subscribers").insert({
      email,
      locale: payload.locale ?? "cs",
      segment,
      source: payload.source ?? "analytics-fallback",
    });

    if (insertError && insertError.code !== "23505") {
      errors.push(insertError.message);
      continue;
    }

    await admin
      .from("analytics")
      .update({
        payload: { ...payload, promoted: true, pending_table: false },
      })
      .eq("id", row.id);
    promoted += 1;
  }

  return { promoted, errors };
}

export async function notifyNewsletterSignup(input: {
  email: string;
  locale: string;
  segment: string;
  source: string;
}): Promise<boolean> {
  const to = adminInbox();
  const result = await sendEmail({
    to,
    subject: `[ViaLongeVita] Nový brief — ${input.email}`,
    html: `<p>Nový odběratel longevity briefu.</p>
<p><strong>E-mail:</strong> ${input.email}<br/>
<strong>Locale:</strong> ${input.locale}<br/>
<strong>Segment:</strong> ${input.segment}<br/>
<strong>Zdroj:</strong> ${input.source}</p>
<p><a href="${SITE.url}/cs/newsletter">Otevřít newsletter</a></p>`,
    text: `Nový brief: ${input.email} (${input.locale}, ${input.segment}, ${input.source})`,
    category: "marketing",
    metadata: { source: input.source, segment: input.segment },
  });
  return result.ok;
}

/** Create table if missing, move fallback analytics rows, return counts. */
export async function runRevenueOps(): Promise<RevenueOpsResult> {
  const errors: string[] = [];
  const schema = await applyNewsletterSubscriberSchema();
  if (!schema.ok && schema.error) errors.push(schema.error);

  let promoted = 0;
  if (schema.ok) {
    const moved = await promoteAnalyticsNewsletterSignups();
    promoted = moved.promoted;
    errors.push(...moved.errors);
  }

  return {
    ok: errors.length === 0 && schema.ok,
    schema,
    promoted,
    notified: 0,
    errors,
    timestamp: new Date().toISOString(),
  };
}
