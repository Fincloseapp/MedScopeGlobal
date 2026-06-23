import { listRecentAiTasks } from "@/lib/academy/ai/workflow";

export default async function AdminAcademyAiPage() {
  const tasks = await listRecentAiTasks(20);

  return (
    <>
      <p className="text-sm text-slate-600">
        AI pipeline — fronta úloh. Dispatch přes PATCH /api/academy/ai/tasks nebo cron academy-daily.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Typ</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Vytvořeno</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{task.task_type}</td>
                <td className="px-4 py-3">{task.status}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(task.created_at).toLocaleString("cs-CZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
