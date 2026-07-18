import Link from "next/link";
import { AccreditedCmeOverview } from "@/components/academy/b2b/accredited-cme-overview";
import { listAccreditedCmeCourses } from "@/lib/academy/b2b/db";
import {
  getPhysicianProfile,
  isVerifiedPhysician,
  resolvePhysicianDisplayName,
} from "@/lib/academy/b2b/verification";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lékařská zóna — MedScope Academy",
  description:
    "Akreditované CME kurzy pro ověřené lékaře s ČLK číslem. Partner institutions, kredity a automatické certifikáty.",
};

export default async function LekarskaZonaPage() {
  const supabase = await createClient();
  const { data: auth } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const profile = auth.user ? await getPhysicianProfile(auth.user.id) : null;
  const verified = isVerifiedPhysician(profile);
  const courses = verified ? await listAccreditedCmeCourses(40) : [];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_45%)]">
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(0,91,150,0.12), transparent 42%), radial-gradient(circle at 88% 0%, rgba(2,29,51,0.08), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-16">
          <p className="text-xs uppercase tracking-[0.18em] text-[#005B96]">
            MedScope Academy · Lékařská zóna
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl tracking-tight text-[#021d33] sm:text-5xl">
            Akreditované CME pro ověřené lékaře
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Turn-key kurzy od partnerských institucí — video, článek, kvíz a ČLK
            akreditace. Přístup pouze pro lékaře s ověřeným ČLK ID (zákon o
            regulaci reklamy).
          </p>

          {verified && profile ? (
            <p className="mt-6 text-sm text-slate-600">
              Přihlášen:{" "}
              <span className="font-medium text-[#021d33]">
                {resolvePhysicianDisplayName(profile)}
              </span>{" "}
              · ČLK {profile.clk_id}
            </p>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/academy/lekari/overeni"
                className="bg-[#005B96] px-5 py-2.5 text-sm font-medium text-white"
              >
                Ověřit ČLK a vstoupit
              </Link>
              <Link
                href="/login?next=/academy/lekari"
                className="border border-slate-300 px-5 py-2.5 text-sm font-medium text-[#021d33]"
              >
                Přihlásit se
              </Link>
              <Link
                href="/academy/partner/reports"
                className="border border-transparent px-5 py-2.5 text-sm font-medium text-slate-500 underline-offset-4 hover:underline"
              >
                Partner reporty
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-6 py-14">
        <AccreditedCmeOverview
          variant="panel"
          activeSpecialization={profile?.specialization ?? null}
        />

        <div id="katalog">
          <h2 className="font-serif text-2xl tracking-tight text-[#021d33]">
            Katalog akreditovaných kurzů
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Tituly, kredity a partneři — po ověření ČLK.
          </p>

          <div className="mt-6">
            {!verified ? (
              <div className="border border-slate-200 bg-white px-6 py-10 text-sm text-slate-600">
                Detailní katalog je dostupný po ověření. Obory výše už teď ukazují,
                že akreditované testy jsou připravené.{" "}
                <Link
                  href="/academy/lekari/overeni"
                  className="font-medium text-[#005B96] hover:underline"
                >
                  Ověřit ČLK a vstoupit
                </Link>
              </div>
            ) : courses.length === 0 ? (
              <div className="border border-slate-200 bg-white px-6 py-10 text-sm text-slate-600">
                Zatím nejsou publikované žádné akreditované kurzy. Obory výše jsou
                připravené — nové testy se zobrazí zde.
              </div>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2">
                {courses.map((course) => (
                  <li key={course.id} className="border border-slate-200 bg-white">
                    <Link
                      href={`/academy/lekari/kurzy/${course.slug}`}
                      className="block px-5 py-5 transition hover:bg-[#f8fafc]"
                    >
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                        {course.partner?.name ?? "Partner"} · {course.credits_count}{" "}
                        kreditů
                      </p>
                      <h3 className="mt-2 font-serif text-2xl tracking-tight text-[#021d33]">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {course.description}
                      </p>
                      <p className="mt-4 text-xs text-slate-500">
                        Akreditace ČLK: {course.accreditation_number}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
