import { sendEmail } from "@/lib/email/engine";
import { LEGAL_DISCLAIMER } from "@/lib/medipacient/patient-summary";
import { MEDIPACIENT } from "@/lib/medipacient/branding";
import { controlEventTitle } from "@/lib/medipacient/control-calendar";
import {
  buildControlReminderCopy,
  pragueToday,
  shouldSendReminderEmail,
  type ControlReminder,
} from "@/lib/medipacient/control-reminder";
import {
  listMeDipacientDocuments,
  listMeDipacientReminders,
  listMeDipacientUserIds,
  markControlReminderEmailed,
  patchMeDipacientReminder,
  type MeDipacientDocument,
} from "@/lib/medipacient/documents";
import { reminderCopyCs, remindersDueToday } from "@/lib/medipacient/reminderEngine";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

function reminderOf(doc: MeDipacientDocument): ControlReminder | undefined {
  return doc.controlReminder;
}

async function emailForUserId(userId: string): Promise<string | null> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    return data.user?.email?.trim() || null;
  } catch {
    return null;
  }
}

export async function sendDueControlRemindersForUser(
  userId: string,
  emailHint?: string | null,
): Promise<{ scanned: number; sent: number; skipped: number }> {
  const today = pragueToday();
  const docs = await listMeDipacientDocuments(userId);
  let sent = 0;
  let skipped = 0;
  const dueDocs = docs.filter((doc) => {
    const reminder = reminderOf(doc);
    return reminder ? shouldSendReminderEmail(reminder, today) : false;
  });
  const scheduled = remindersDueToday(await listMeDipacientReminders(userId), today);
  if (!dueDocs.length && !scheduled.length) return { scanned: docs.length, sent: 0, skipped: 0 };

  const email = emailHint?.trim() || (await emailForUserId(userId));
  if (!email) return { scanned: docs.length, sent: 0, skipped: dueDocs.length + scheduled.length };

  for (const doc of dueDocs) {
    const reminder = reminderOf(doc)!;
    const title = controlEventTitle(doc.patientSummary?.obor_lekare);
    const overdue = reminder.dueAt < today;
    const content = buildControlReminderCopy({
      title,
      dueAt: reminder.dueAt,
      overdue,
      appUrl: MEDIPACIENT.appUrl,
      disclaimer: LEGAL_DISCLAIMER,
    });
    const mail = await sendEmail({
      to: email,
      subject: content.subject,
      html: content.html,
      text: content.text,
      category: "transactional",
      metadata: { kind: "medipacient_control_reminder", documentId: doc.id, dueAt: reminder.dueAt },
    });
    if (mail.ok) {
      await markControlReminderEmailed(userId, doc.id, today);
      sent += 1;
    } else {
      skipped += 1;
    }
  }

  for (const item of scheduled) {
    if (item.kind === "visit" && dueDocs.some((doc) => doc.id === item.documentId)) continue;
    const overdue = item.visitAt < today;
    const copy = reminderCopyCs(item, overdue);
    const text = [copy.lead, "", `Otevřít aplikaci: ${MEDIPACIENT.appUrl}`, "", LEGAL_DISCLAIMER, "MeDipacient není zdravotnický prostředek."].join("\n");
    const html = `<p style="font-size:18px;line-height:1.5">${copy.lead}</p>
<p><a href="${MEDIPACIENT.appUrl}" style="display:inline-block;padding:12px 20px;background:#2D7FF9;color:#fff;text-decoration:none;border-radius:999px;font-size:18px">Otevřít MeDipacient</a></p>
<p style="font-size:14px;color:#334155">${LEGAL_DISCLAIMER} MeDipacient není zdravotnický prostředek.</p>`;
    const mail = await sendEmail({
      to: email,
      subject: copy.subject,
      html,
      text,
      category: "transactional",
      metadata: { kind: `medipacient_reminder_${item.kind}`, documentId: item.documentId, fireAt: item.fireAt },
    });
    if (mail.ok) {
      await patchMeDipacientReminder(userId, item.id, { emailSentOn: today });
      sent += 1;
    } else {
      skipped += 1;
    }
  }
  return { scanned: docs.length, sent, skipped };
}

export async function runMeDipacientReminderDigest(limit = 80): Promise<{
  users: number;
  sent: number;
  skipped: number;
}> {
  const userIds = (await listMeDipacientUserIds()).slice(0, limit);
  let sent = 0;
  let skipped = 0;
  for (const userId of userIds) {
    try {
      const result = await sendDueControlRemindersForUser(userId);
      sent += result.sent;
      skipped += result.skipped;
    } catch {
      skipped += 1;
    }
  }
  return { users: userIds.length, sent, skipped };
}
