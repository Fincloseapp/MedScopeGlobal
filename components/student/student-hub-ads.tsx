import { HomepageStudentSponsored } from "@/components/home/homepage-student-sponsored";

export async function StudentHubAds({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={className} aria-label="MeDiprep pro studenty">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F97316]">
        MeDiprep
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold text-[#0A192F] sm:text-2xl">
        Aplikace na přijímačky LF
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Originální testy B/C/F, simulace 8 českých fakult. Stáhnete na plochu — e-mail + kód, bez hesla.
      </p>
      <HomepageStudentSponsored />
    </section>
  );
}
