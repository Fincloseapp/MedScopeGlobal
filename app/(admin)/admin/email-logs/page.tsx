import Link from "next/link";
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
  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Email logs</h1>
        <p className="text-muted-foreground">
          v28 delivery log — SendGrid primary, SMTP fallback. Test endpoints:{" "}
          <code>/api/test-email/sendgrid</code>, <code>/api/test-email/smtp</code>,{" "}
          <code>/api/test-email/ai</code>
          {" · "}
          <Link href="/admin/stripe-webhook-logs" className="text-primary hover:underline">
            Stripe webhook logs →
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Celkem</p>
          <p className="text-2xl font-bold text-medical-navy">{logs.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Odesláno</p>
          <p className="text-2xl font-bold text-green-700">{sent}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Selhalo</p>
          <p className="text-2xl font-bold text-red-700">{failed}</p>
        </div>
      </div>

      {detail ? <EmailLogDetail log={detail} /> : null}
      <EmailLogTable logs={logs} />
    </div>
  );
}
