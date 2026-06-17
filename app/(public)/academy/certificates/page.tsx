import Link from "next/link";
import { Award, Download } from "lucide-react";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listPublishedCourses, listUserCertificates } from "@/lib/academy/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEMO_CERTIFICATES = [
  {
    id: "demo-anatomie",
    courseTitle: "Úvod do anatomie",
    certificateCode: "MSA-2026-DEMO01",
    issuedAt: "15. 5. 2026",
    score: 92,
  },
  {
    id: "demo-farmakologie",
    courseTitle: "Úvod do farmakologie",
    certificateCode: "MSA-2026-DEMO02",
    issuedAt: "2. 6. 2026",
    score: 88,
  },
];

export default async function AcademyCertificatesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [certificates, courses] = auth.user
    ? await Promise.all([listUserCertificates(auth.user.id), listPublishedCourses(50)])
    : [[], []];

  return (
    <>
      <AcademyPageHeader
        eyebrow="Certifikáty"
        title="Galerie certifikátů"
        description={
          auth.user
            ? "Vaše absolvované kurzy a certifikáty ke stažení."
            : "Ukázka certifikátů MedScope Academy — přihlaste se pro vlastní galerii."
        }
        ctaHref={auth.user ? "/academy/profile" : "/login"}
        ctaLabel={auth.user ? "Můj profil" : "Přihlásit se"}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {auth.user && certificates.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => {
              const course = courses.find((c) => c.id === cert.course_id);
              const meta = cert.metadata as { score?: number };
              return (
                <li
                  key={cert.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[#005B96]">
                      <Award className="h-5 w-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Certifikát</span>
                    </div>
                    <h2 className="mt-2 font-display text-lg font-semibold text-[#021d33]">
                      {course?.title ?? "MedScope Academy kurz"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">{cert.certificate_code}</p>
                    {meta.score != null ? (
                      <p className="mt-2 text-sm text-slate-600">Skóre kvízu: {meta.score}%</p>
                    ) : null}
                  </div>
                  <a
                    href={`/api/academy/certificates/${cert.id}/download`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#005B96] px-4 py-2 text-sm text-white hover:bg-[#004a7a]"
                  >
                    <Download className="h-4 w-4" />
                    Stáhnout PDF
                  </a>
                </li>
              );
            })}
          </ul>
        ) : auth.user ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Zatím nemáte žádné certifikáty. Dokončete kurz a úspěšně složte kvíz.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              Ukázkové certifikáty (demo).{" "}
              <Link href="/login" className="text-[#005B96] hover:underline">
                Přihlaste se
              </Link>{" "}
              pro stažení vlastních.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {DEMO_CERTIFICATES.map((demo) => (
                <li
                  key={demo.id}
                  className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 opacity-90"
                >
                  <div className="flex items-center gap-2 text-slate-500">
                    <Award className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Demo</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold text-[#021d33]">{demo.courseTitle}</h2>
                  <p className="mt-1 text-xs text-slate-500">{demo.certificateCode}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Vydáno {demo.issuedAt} · skóre {demo.score}%
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
