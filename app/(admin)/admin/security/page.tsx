import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Security Logs",
  robots: { index: false },
};

export default async function AdminSecurityLogsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/login?next=/admin/security");

  const admin = createServiceRoleClient();
  const { data: logs } = await admin
    .from("security_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Security Logs</h1>
        <p className="text-sm text-muted-foreground">
          Posledních 100 bezpečnostních událostí (admin only).
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
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
