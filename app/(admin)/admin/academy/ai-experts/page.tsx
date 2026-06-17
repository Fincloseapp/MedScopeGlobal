import { createServiceRoleClient } from "@/lib/supabase/service";

export default async function AdminAcademyAiExpertsPage() {
  const admin = createServiceRoleClient();
  const { data: reviews } = await admin
    .from("ai_expert_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <p className="text-sm text-slate-600">
        Expert review pipeline — výsledky z workeru <code className="text-xs">expert-review</code> (LLM + DB).
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Expert</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3">Skóre</th>
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3">{row.expert_type}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.score ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
