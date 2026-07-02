import { runSystemTest } from "@/lib/academy/db";
import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyTestingPage() {
  let test: Awaited<ReturnType<typeof runSystemTest>> | null = null;
  try {
    test = await runSystemTest("academy-admin-panel");
  } catch {
    test = null;
  }

  const admin = createServiceRoleClient();
  const { data: tests } = await admin.from("system_tests").select("*").order("updated_at", { ascending: false }).limit(20);

  return (
    <>
      <p className="text-sm text-slate-600">
        System tests — GET /api/academy/testing/run nebo POST s admin auth.
      </p>
      {test ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p>
            Poslední běh: <strong>{test.name}</strong> — {test.status}
          </p>
        </div>
      ) : null}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Název</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Poslední běh</th>
            </tr>
          </thead>
          <tbody>
            {(tests ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">
                  {row.last_run_at ? new Date(row.last_run_at).toLocaleString("cs-CZ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
