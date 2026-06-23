import Link from "next/link";
import { GraduationCap, Microscope, Stethoscope } from "lucide-react";
import type { LocaleCode } from "@/lib/i18n/config";

const segmentsCs = [
  {
    id: "laik-student",
    icon: GraduationCap,
    title: "Laik a student",
    subtitle: "Srozumitelně, bez zbytečného žargonu",
    description:
      "Prevence, orientace ve zdraví, příprava na medicínu a studijní materiály pro budoucí i začínající studenty LF.",
    href: "/pro-koho/laik-student",
    cta: "Vstoupit jako laik / student",
    highlights: ["Příprava na LF", "Edukace pro veřejnost", "Studijní přehledy"],
  },
  {
    id: "lekar",
    icon: Stethoscope,
    title: "Lékař v praxi",
    subtitle: "Klinická rozhodnutí a každodenní praxe",
    description:
      "Kurátorované články, guidelines, kazuistiky a praktické postupy pro lékaře a specialisty v ambulanci i lůžkové péči.",
    href: "/pro-koho/lekar",
    cta: "Obsah pro lékaře",
    highlights: ["Klinická praxe", "Guidelines", "Kazuistiky"],
  },
  {
    id: "vedec",
    icon: Microscope,
    title: "Vědec a výzkumník",
    subtitle: "Evidence, studie a metodika",
    description:
      "Monitoring publikací, shrnutí studií, výzkumné briefy a diskusní podklady pro klinický výzkum a akademickou medicínu.",
    href: "/pro-koho/vedec",
    cta: "Výzkumný přehled",
    highlights: ["Studie a meta-analýzy", "Metodika", "Výzkumné novinky"],
  },
] as const;

const segmentsEn = [
  {
    id: "laik-student",
    icon: GraduationCap,
    title: "Public & students",
    subtitle: "Clear, accessible medical education",
    description:
      "Prevention, health literacy, pre-med preparation, and structured learning for medical students.",
    href: "/pro-koho/laik-student",
    cta: "Enter as learner",
    highlights: ["Pre-med track", "Patient education", "Study guides"],
  },
  {
    id: "lekar",
    icon: Stethoscope,
    title: "Clinicians",
    subtitle: "Practice-ready clinical intelligence",
    description:
      "Curated articles, guidelines, case reports, and decision support for daily clinical work.",
    href: "/pro-koho/lekar",
    cta: "Clinical content",
    highlights: ["Clinical practice", "Guidelines", "Case reports"],
  },
  {
    id: "vedec",
    icon: Microscope,
    title: "Researchers",
    subtitle: "Evidence and study intelligence",
    description:
      "Publication monitoring, study digests, and research briefs for clinical and academic teams.",
    href: "/pro-koho/vedec",
    cta: "Research hub",
    highlights: ["Studies", "Methods", "Research news"],
  },
] as const;

export function AudienceHub({ locale }: { locale: LocaleCode }) {
  const isCs = locale === "cs";
  const segments = isCs ? segmentsCs : segmentsEn;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="audience-heading">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
          {isCs ? "Pro koho je MedScopeGlobal" : "Who we serve"}
        </p>
        <h2 id="audience-heading" className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
          {isCs ? "Jeden portál, tři odborné perspektivy" : "One platform, three expert perspectives"}
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          {isCs
            ? "Obsah filtrujeme podle vaší role — laická veřejnost a studenti vidí srozumitelné výklady, lékaři klinickou hloubku, vědci výzkumnou evidenci."
            : "Content is filtered by role — learners get accessible explanations, clinicians get practice depth, researchers get evidence focus."}
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {segments.map((segment) => {
          const Icon = segment.icon;
          return (
            <article
              key={segment.id}
              className="flex flex-col rounded-[28px] border border-[#dfeaf5] bg-white p-6 shadow-[0_18px_46px_-28px_rgba(0,91,150,0.7)]"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6f4ff] text-[#005B96]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#005B96]">
                {segment.subtitle}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-[#021d33]">{segment.title}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-600">{segment.description}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
                {segment.highlights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <Link
                href={segment.href}
                className="mt-5 inline-flex rounded-full bg-[#005B96] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004874]"
              >
                {segment.cta}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
