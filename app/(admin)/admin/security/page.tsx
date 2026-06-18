import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { V46_UI_VERSION, V46_COMPOSITE_LABEL } from "@/lib/v46/version";
import { getThreatDetectorStatus } from "@/lib/v46/security/threat-detector";

export const metadata: Metadata = {
  title: "Security Dashboard",
  robots: { index: false },
};

export default async function AdminSecurityLogsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/login?next=/admin/security");

  const admin = createServiceRoleClient();
  const [{ data: logs }, { data: healthEvents }] = await Promise.all([
    admin.from("security_logs").select("*").order("timestamp", { ascending: false }).limit(50),
    admin.from("system_health_events").select("*").order("created_at", { ascending: false }).limit(20).then(
      (r) => r,
      () => ({ data: [] })
    ),
  ]);

  const threat = getThreatDetectorStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Security Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          v46 security engine — {V46_UI_VERSION} ({V46_COMPOSITE_LABEL})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Threat patterns</p>
          <p className="text-2xl font-semibold">{threat.patterns}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Active IP bans</p>
          <p className="text-2xl font-semibold">{threat.active_bans}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Escalation</p>
          <p className="text-sm">{threat.escalation}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <p className="font-medium mb-2">v42 Key Rotation Note</p>
        <p className="text-muted-foreground">
          ElevenLabs API keys must be regenerated manually at{" "}
          <a href="https://elevenlabs.io" className="underline" target="_blank" rel="noreferrer">
            elevenlabs.io
          </a>
          . No public API exists for auto-creation. Monitor:{" "}
          <code className="text-xs">/api/v42/health</code>
        </p>
      </div>

      {healthEvents && healthEvents.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <h2 className="px-3 py-2 font-medium text-sm bg-muted/50">System Health Events (v43)</h2>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left">Čas</th>
                <th className="px-3 py-2 text-left">Subsystem</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {healthEvents.map((ev) => (
                <tr key={ev.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(ev.created_at).toLocaleString("cs-CZ")}</td>
                  <td className="px-3 py-2">{ev.subsystem}</td>
                  <td className="px-3 py-2">{ev.status}</td>
                  <td className="px-3 py-2 text-xs">{ev.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <h2 className="px-3 py-2 font-medium text-sm bg-muted/50">Security Logs</h2>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Čas</th>
              <th className="px-3 py-2 text-left">Akce</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">IP</th>
              <th className="px-3 py-2 text-left">User</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("cs-CZ")}
                </td>
                <td className="px-3 py-2">{log.action}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      log.status === "blocked"
                        ? "text-destructive"
                        : log.status === "ok"
                          ? "text-emerald-600"
                          : "text-amber-600"
                    }
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{log.ip ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{log.user_id ?? "—"}</td>
              </tr>
            ))}
            {!logs?.length && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Zatím žádné záznamy. Spusťte migraci 20260603000000.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
