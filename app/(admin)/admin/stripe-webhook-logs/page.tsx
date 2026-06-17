import Link from "next/link";
import { StripeWebhookLogTable } from "@/components/admin/stripe-webhook-log-table";
import { listStripeWebhookLogs } from "@/lib/billing/stripe-webhook-log";

export const dynamic = "force-dynamic";

export default async function AdminStripeWebhookLogsPage() {
  const logs = await listStripeWebhookLogs(200);
  const processed = logs.filter((l) => l.status === "processed").length;
  const failed = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-medical-navy">Stripe webhook logs</h1>
        <p className="text-muted-foreground">
          v28.2 webhook audit trail — checkout, subscriptions, Academy marketplace.{" "}
          <Link href="/admin/email-logs" className="text-primary hover:underline">
            Email logs →
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Celkem</p>
          <p className="text-2xl font-bold text-medical-navy">{logs.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Zpracováno</p>
          <p className="text-2xl font-bold text-green-700">{processed}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-muted-foreground">Selhalo</p>
          <p className="text-2xl font-bold text-red-700">{failed}</p>
        </div>
      </div>

      <StripeWebhookLogTable logs={logs} />
    </div>
  );
}
