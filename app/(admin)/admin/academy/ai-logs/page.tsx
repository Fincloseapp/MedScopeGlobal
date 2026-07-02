import { listAiLogs } from "@/lib/academy/db";

export default async function AdminAcademyAiLogsPage() {
  let logs: Awaited<ReturnType<typeof listAiLogs>> = [];
  try {
    logs = await listAiLogs(50);
  } catch {
    logs = [];
  }

  return (
    <>
      <p className="text-sm text-slate-600">{logs.length} posledních AI logů.</p>
      <div className="mt-4 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{log.worker}</span>
              <span>{log.level}</span>
              <span>{new Date(log.created_at).toLocaleString("cs-CZ")}</span>
            </div>
            <p className="mt-1 text-[#021d33]">{log.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
