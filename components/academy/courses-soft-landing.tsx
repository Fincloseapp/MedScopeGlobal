import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";

/**
 * Calm “připravujeme” state for /academy/courses while catalog quality is soft-gated.
 * See lib/academy/public-catalog.ts to re-enable the full grid.
 */
export function AcademyCoursesSoftLanding({
  variant = "catalog",
}: {
  variant?: "catalog" | "prep";
}) {
  const isPrep = variant === "prep";

  return (
    <>
      <AcademyPageHeader
        eyebrow="MedScope Academy"
        title={isPrep ? "Příprava na přijímačky" : "Kurzy"}
        description={
          isPrep
            ? "Připravujeme kvalitnější přípravnou cestu pro uchazeče o LF — zatím bez veřejného katalogu kurzů."
            : "Připravujeme kurzy, které obstojí vedle redakce MedScopeGlobal. Katalog zatím nezveřejňujeme naplno."
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="border border-[#d9e8f4] bg-white px-6 py-10 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            Připravujeme
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-[#021d33]">
            Brzy otevřeme silnější vzdělávací katalog
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Nechceme vás posílat do polovičatého obsahu. Academy zůstává součástí medscopeglobal.com —
            jakmile budou kurzy redakčně a odborně připravené, katalog znovu zviditelníme.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/academy" className="font-medium text-[#005B96] hover:underline">
              Zpět na Academy
            </Link>
            <Link href="/articles" className="text-slate-600 hover:underline">
              Číst magazín
            </Link>
            <Link href="/app/priprava" className="text-slate-600 hover:underline">
              MeDiprep — přijímačky
            </Link>
            <Link href="/predplatne" className="text-slate-600 hover:underline">
              Předplatné
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
