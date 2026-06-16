import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { AcademyAdminNav } from "@/components/academy/admin-nav";
import { listMentoringSessions } from "@/lib/academy/db";

export default async function AdminAcademyMentoringPage() {
  const sessions = await listMentoringSessions(undefined, 50);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <MedScopeLogo href="/admin" preset="admin-sidebar" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-[#021d33]">Mentoring</h1>
      <AcademyAdminNav active="/admin/academy/mentoring" />
      <p className="mt-4 text-sm text-slate-600">{sessions.length} mentoring sessions.</p>
      <ul className="mt-4 space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            {s.status} — {s.scheduled_at?.slice(0, 10) ?? "neplánováno"}
          </li>
        ))}
      </ul>
      <Link href="/admin/academy" className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na dashboard
      </Link>
    </div>
  );
}
