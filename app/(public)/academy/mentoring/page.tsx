import { AcademyPageHeader } from "@/components/academy/page-header";
import { listMentoringSessions } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export default async function AcademyMentoringPage() {
  const sessions = await listMentoringSessions(undefined, 20);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Mentoring"
        title="AI a lidský mentoring"
        description="Rezervujte si konzultaci s mentorem nebo AI tutorem k libovolnému kurzu."
        ctaHref="/login"
        ctaLabel="Požádat o mentoring"
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-600">
          Po přihlášení můžete vytvořit požadavek přes POST /api/academy/mentoring.
        </p>
        {sessions.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <span className="font-medium">{s.status}</span>
                {s.scheduled_at ? (
                  <span className="ml-2 text-slate-600">{new Date(s.scheduled_at).toLocaleString("cs-CZ")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
