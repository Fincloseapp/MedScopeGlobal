import { AcademyPageHeader } from "@/components/academy/page-header";
import { AiLecturerPanel } from "@/components/academy/ai-lecturer-panel";
import { listMentoringSessions } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

export default async function AcademyMentoringPage() {
  const sessions = await listMentoringSessions(undefined, 20);

  return (
    <>
      <AcademyPageHeader
        eyebrow="Mentoring"
        title="AI a lidský mentoring"
        description="AI tutor pro medicínské studium a rezervace s lidským mentorem."
        ctaHref="/academy/courses"
        ctaLabel="Prohlédnout kurzy"
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#021d33]">Lidský mentoring</h2>
            <p className="mt-2 text-sm text-slate-600">
              Po přihlášení můžete požádat o konzultaci s mentorem k libovolnému kurzu MedScope Academy.
            </p>
            {sessions.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {sessions.map((s) => (
                  <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                    <span className="font-medium">{s.status}</span>
                    {s.scheduled_at ? (
                      <span className="ml-2 text-slate-600">
                        {new Date(s.scheduled_at).toLocaleString("cs-CZ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                Zatím žádné naplánované sezení. Přihlaste se a vytvořte požadavek přes profil.
              </p>
            )}
          </div>
          <aside>
            <AiLecturerPanel
              lessonTitle="Obecný medicínský tutor"
              lessonContent="MedScope Academy — anatomie, farmakologie, kardiologie a klinická praxe."
              courseTitle="MedScope Academy"
              compact
            />
          </aside>
        </div>
      </div>
    </>
  );
}
