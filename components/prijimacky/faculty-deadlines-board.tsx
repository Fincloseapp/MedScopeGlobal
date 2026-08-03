import Link from "next/link";
import { CalendarClock, ExternalLink, MapPin } from "lucide-react";
import {
  FACULTIES_ADMISSIONS_2026,
  PRIJIMACKY_CYCLE_LABEL,
  daysUntilDeadline,
  sortFacultiesByDeadline,
  subjectLabel,
  type FacultyAdmissions,
} from "@/lib/prijimacky/faculties-admissions";

function deadlineTone(days: number | null): string {
  if (days == null) return "bg-slate-100 text-slate-700";
  if (days < 0) return "bg-slate-200 text-slate-600";
  if (days <= 30) return "bg-rose-100 text-rose-800";
  if (days <= 90) return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

function deadlineLabel(days: number | null): string {
  if (days == null) return "Termín ověřte na webu";
  if (days < 0) return "Deadline proběhl — ověřte další kolo";
  if (days === 0) return "Deadline dnes";
  if (days === 1) return "Zbývá 1 den";
  return `Zbývá ${days} dní`;
}

function FacultyCard({ f }: { f: FacultyAdmissions }) {
  const days = daysUntilDeadline(f.applicationDeadline);
  return (
    <article className="flex flex-col rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-[#021d33]">{f.shortName}</p>
          <p className="mt-0.5 text-sm text-slate-600">{f.name}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {f.city}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${deadlineTone(days)}`}>
          {deadlineLabel(days)}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Přihlášky od</dt>
          <dd className="font-medium text-[#021d33]">{f.applicationOpen}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Přihlášku podat do</dt>
          <dd className="font-semibold text-[#005B96]">{f.applicationDeadline}</dd>
        </div>
        <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Zkoušky</dt>
          <dd className="text-right font-medium text-[#021d33]">{f.examWindow}</dd>
        </div>
        {typeof f.feeCzk === "number" ? (
          <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Poplatek</dt>
            <dd className="font-medium text-[#021d33]">{f.feeCzk} Kč</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {f.subjects.map((s) => (
          <span
            key={s}
            className="rounded-full bg-[#f0f7ff] px-2.5 py-0.5 text-[11px] font-medium text-[#005B96]"
          >
            {subjectLabel(s)}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">{f.examNote}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a
          href={f.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-[#005B96] hover:underline"
        >
          Oficiální přihláška
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <Link href={`/studium/univerzity/${f.slug}`} className="text-slate-600 hover:underline">
          Detail fakulty
        </Link>
      </div>
    </article>
  );
}

export function FacultyDeadlinesBoard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const faculties = sortFacultiesByDeadline(FACULTIES_ADMISSIONS_2026);
  return (
    <section className="rounded-3xl border border-[#cfe1f3] bg-gradient-to-br from-[#f4f9ff] via-white to-[#eef6ff] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            {PRIJIMACKY_CYCLE_LABEL}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[#021d33] sm:text-3xl">
            Termíny přihlášek na lékařské fakulty
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Přehled pro maturanty gymnázií — kdy otevřít přihlášku, dokdy ji podat a kdy čekat zkoušky.
            Vždy ověřte finální data na oficiálním webu fakulty.
          </p>
        </div>
        {!compact ? (
          <Link
            href="/studium/prijimacky"
            className="rounded-full border border-[#005B96]/25 bg-white px-4 py-2 text-sm font-medium text-[#005B96] hover:bg-[#005B96]/5"
          >
            Celý přehled přijímaček
          </Link>
        ) : null}
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-2"}`}>
        {faculties.map((f) => (
          <FacultyCard key={f.slug} f={f} />
        ))}
      </div>
    </section>
  );
}
