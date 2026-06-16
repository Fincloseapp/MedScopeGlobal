import { AcademyPageHeader } from "@/components/academy/page-header";
import { listMentoringSessions } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademyMentoringPage() {
  const sessions = await listMentoringSessions(undefined, 20);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Mentoring"
        title="AI a lidský mentoring"
        description="Spojte se s mentory pro klinickou praxi a studium."
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {sessions.length > 0 ? (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl border border-[#cfe1f3] bg-white px-5 py-4 text-sm">
                {s.status} — {s.scheduled_at?.slice(0, 16) ?? "Na vyžádání"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-slate-500">
            Mentoring sessions budou brzy k dispozici. Sledujte Academy.
          </p>
        )}
      </div>
    </>
  );
}
