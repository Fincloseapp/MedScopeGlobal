import { EmailLogDetail } from "@/components/admin/email-log-detail";
import { EmailLogTable } from "@/components/admin/email-log-table";
import { getEmailLog, listEmailLogs } from "@/lib/email/log";

export const dynamic = "force-dynamic";

export default async function AdminEmailLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ detail?: string }>;
}) {
  const params = await searchParams;
  const logs = await listEmailLogs(200);
  const detail = params.detail ? await getEmailLog(params.detail) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Email logs</h1>
        <p className="text-muted-foreground">
          v28 delivery log — SendGrid primary, SMTP fallback. Test endpoints:{" "}
          <code>/api/test-email/sendgrid</code>, <code>/api/test-email/smtp</code>,{" "}
          <code>/api/test-email/ai</code>
        </p>
      </div>
      {detail ? <EmailLogDetail log={detail} /> : null}
      <EmailLogTable logs={logs} />
    </div>
  );
}
