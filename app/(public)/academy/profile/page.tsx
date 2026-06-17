import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { computeCourseBadges, computeXpBadges } from "@/lib/academy/badges";
import {
  getLeaderboard,
  getUserProgress,
  listPublishedCourses,
  listUserCertificates,
  countUserQuizPasses,
} from "@/lib/academy/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AcademyProfilePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <>
        <AcademyPageHeader
          eyebrow="Profil"
          title="Váš Academy profil"
          description="Přihlaste se pro sledování postupu, XP, odznaků a certifikátů."
          ctaHref="/login"
          ctaLabel="Přihlásit se"
        />
      </>
    );
  }

  const [progress, leaderboard, certificates, courses, quizPasses] = await Promise.all([
    getUserProgress(auth.user.id),
    getLeaderboard("all_time", 100),
    listUserCertificates(auth.user.id),
    listPublishedCourses(50),
    countUserQuizPasses(auth.user.id),
  ]);

  const myRank = leaderboard.find((e) => e.user_id === auth.user!.id);
  const totalXp = myRank?.total_xp ?? 0;
  const completedCourses = progress.filter((p) => p.status === "completed" && !p.lesson_id).length;

  const xpBadges = computeXpBadges(totalXp);
  const courseBadges = computeCourseBadges({
    completedCourses,
    passedQuizzes: quizPasses,
    certificates: certificates.length,
  });

  const enrolledCourseIds = new Set(progress.map((p) => p.course_id));
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c.id));

  return (
    <>
      <AcademyPageHeader
        eyebrow="Profil"
        title="Váš Academy profil"
        description={`Uživatel: ${auth.user.email}`}
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Celkové XP</p>
            <p className="mt-1 text-3xl font-bold text-[#021d33]">{totalXp}</p>
            <Link href="/academy/leaderboard" className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
              Žebříček →
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Aktivní kurzy</p>
            <p className="mt-1 text-3xl font-bold text-[#021d33]">{enrolledCourses.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Certifikáty</p>
            <p className="mt-1 text-3xl font-bold text-[#021d33]">{certificates.length}</p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-[#021d33]">Odznaky</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {[...xpBadges, ...courseBadges].map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl border px-4 py-3 ${
                  badge.earned
                    ? "border-[#005B96]/30 bg-[#f0f7fc]"
                    : "border-slate-100 bg-slate-50 opacity-60"
                }`}
                title={badge.description}
              >
                <span className="text-xl">{badge.icon}</span>
                <p className="mt-1 text-sm font-medium text-[#021d33]">{badge.label}</p>
                <p className="text-xs text-slate-500">{badge.description}</p>
              </div>
            ))}
          </div>
        </section>

        {enrolledCourses.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-[#021d33]">Zapsané kurzy</h2>
            <ul className="mt-3 space-y-2">
              {enrolledCourses.map((course) => {
                const prog = progress.find((p) => p.course_id === course.id && !p.lesson_id);
                return (
                  <li key={course.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <Link href={`/academy/courses/${course.slug}`} className="font-medium text-[#005B96] hover:underline">
                      {course.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {prog?.status === "completed"
                        ? `Dokončeno · kvíz ${prog.quiz_score ?? "—"}%`
                        : `Postup ${prog?.progress_pct ?? 0}%`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {certificates.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-[#021d33]">Certifikáty ke stažení</h2>
            <ul className="mt-3 space-y-2">
              {certificates.map((cert) => {
                const course = courses.find((c) => c.id === cert.course_id);
                return (
                  <li key={cert.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="font-medium text-[#021d33]">{course?.title ?? "Kurz"}</p>
                      <p className="text-xs text-slate-500">{cert.certificate_code}</p>
                    </div>
                    <a
                      href={`/api/academy/certificates/${cert.id}/download`}
                      className="rounded-lg bg-[#005B96] px-3 py-1.5 text-sm text-white hover:bg-[#004a7a]"
                    >
                      Stáhnout PDF
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
