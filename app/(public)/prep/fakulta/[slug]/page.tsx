import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrepShell } from "@/components/prep/prep-shell";
import { FacultyPicker } from "@/components/prep/faculty-picker";
import { getPrepFaculty, facultyAdmissions, simulationTotals } from "@/lib/prep/faculties";
import { PREP_FACULTIES } from "@/lib/prep/faculties";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { subjectLabel } from "@/lib/prijimacky/faculties-admissions";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PREP_FACULTIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getPrepFaculty(slug);
  return buildV20PageMetadata({
    title: f ? `MeDiprep · ${f.shortName}` : "MeDiprep",
    description: f
      ? `Tréninkový formát přijímaček ${f.shortName} (${f.city}): biologie, chemie, fyzika. Originální otázky, časovaná simulace.`
      : "Příprava na přijímačky LF",
    path: `/prep/fakulta/${slug}`,
  });
}

export default async function PrepFacultyPage({ params }: Props) {
  const { slug } = await params;
  const f = getPrepFaculty(slug);
  if (!f) notFound();
  const adm = facultyAdmissions(slug);
  const tot = simulationTotals(f);

  return (
    <PrepShell active="/prep">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <FacultyPicker current={slug} />
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C45C26]">{f.city}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{f.shortName}</h1>
          <p className="mt-2 text-sm text-[#5a5348]">{f.name}</p>
        </header>
        <p className="text-base leading-relaxed text-[#3d4a5c]">{f.examStyle}</p>
        <ul className="flex flex-wrap gap-2">
          {f.emphasis.map((e) => (
            <li key={e} className="rounded-full bg-white px-3 py-1 text-sm text-[#3d4a5c] ring-1 ring-[#e0d5c4]">
              {e}
            </li>
          ))}
        </ul>
        <section className="rounded-[24px] border border-[#e0d5c4] bg-white p-6">
          <h2 className="font-display text-xl font-semibold">{f.simulation.label}</h2>
          <p className="mt-2 text-sm text-[#5a5348]">
            {tot.questions} otázek · {tot.minutes} min · hranice {f.simulation.passingPct} % ·{" "}
            {f.simulation.scoring === "plusMinus" ? "−0,25 za chybu" : "+1 / 0"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tot.mixed
              ? (["biologie", "chemie", "fyzika"] as const).map((s) => (
                  <span key={s} className="rounded-full bg-[#F3EDE1] px-3 py-1 text-xs">
                    {subjectLabel(s)} · 18
                  </span>
                ))
              : f.simulation.blocks.map((b) => (
                  <span key={b.subject} className="rounded-full bg-[#F3EDE1] px-3 py-1 text-xs">
                    {subjectLabel(b.subject)} · {b.count} / {b.minutes} min
                  </span>
                ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[#8a8174]">{f.simulation.officialHint}</p>
          <Link
            href={`/app/priprava?tab=testy&mode=simulation&faculty=${f.slug}`}
            className="mt-5 inline-flex rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Spustit simulaci v MeDiprep
          </Link>
        </section>
        {adm ? (
          <p className="text-xs text-[#6b6256]">
            Přihlášky do {adm.applicationDeadline} · zkoušky {adm.examWindow} ·{" "}
            <a href={adm.url} className="text-[#005B96] underline" target="_blank" rel="noopener noreferrer">
              oficiální web
            </a>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/app/priprava?tab=uceni" className="rounded-full border border-[#1A2332]/20 px-4 py-2">
            Učení po kapitolách
          </Link>
          <Link href="/app/priprava?tab=plan" className="rounded-full border border-[#1A2332]/20 px-4 py-2">
            Týdenní plán
          </Link>
        </div>
      </div>
    </PrepShell>
  );
}
