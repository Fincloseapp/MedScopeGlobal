import Image from "next/image";
import { APP_MARKETING_IMAGE } from "@/lib/brand/marketing-visuals";
import type { FacultyAdmissions } from "@/lib/prijimacky/faculties-admissions";

export function StudentStudioDesk({
  cs,
  faculties,
  introLabel,
  monthlyLabel,
  question,
  options,
  subject,
}: {
  cs: boolean;
  faculties: FacultyAdmissions[];
  introLabel: string;
  monthlyLabel: string;
  question?: string;
  options?: string[];
  subject?: string;
}) {
  const row = faculties.slice(0, 4);

  return (
    <div data-studio="desk" className="relative mx-auto w-full max-w-[540px]">
      <div className="overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#07111c] shadow-[0_40px_80px_-24px_rgba(2,12,24,0.85)]">
        <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#c45c4a]/80" />
          <span className="h-2 w-2 rounded-full bg-[#d4af37]/70" />
          <span className="h-2 w-2 rounded-full bg-[#3d8b6e]/70" />
          <span className="ml-2 truncate font-mono text-[10px] tracking-[0.18em] text-white/35">
            medscopeglobal.com/studenti
          </span>
        </div>

        <div className="grid grid-cols-[5.4rem_1fr] sm:grid-cols-[6.4rem_1fr]">
          <aside className="space-y-2 border-r border-white/8 bg-[#050c14] px-2 py-3">
            <p className="px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/80">
              Desk
            </p>
            {(cs
              ? ["Kvíz", "Simulace", "Fakulty", "Tutor"]
              : ["Quiz", "Mocks", "Faculties", "Tutor"]
            ).map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-2 py-1.5 text-[10px] ${
                  i === 0 ? "bg-white/10 text-white" : "text-white/45"
                }`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="min-w-0">
            <div className="relative h-[132px] sm:h-[158px]">
              <Image
                src={APP_MARKETING_IMAGE.mediprep}
                alt="MeDiprep"
                fill
                className="object-cover object-top"
                sizes="420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111c] via-transparent to-transparent" />
              <p className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                MeDiprep
              </p>
            </div>

            {question && options?.length ? (
              <div className="px-2.5 py-2.5">
                <p className="font-mono text-[9px] tracking-[0.18em] text-[#c6a15b]">
                  {subject ?? "B/C/F"}
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-white/90">{question}</p>
                <ul className="mt-2 space-y-1">
                  {options.slice(0, 4).map((opt) => (
                    <li
                      key={opt}
                      className="truncate rounded-md border border-white/8 bg-white/[0.04] px-2 py-1 text-[10px] text-white/65"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border-t border-white/8 px-2.5 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {cs ? "Oficiální weby" : "Official sites"}
              </p>
              <ul className="mt-1 space-y-0.5">
                {row.map((f) => (
                  <li
                    key={f.slug}
                    className="flex items-baseline justify-between gap-2 text-[10px] text-white/70"
                  >
                    <span className="truncate font-medium text-white/90">{f.shortName}</span>
                    <span className="shrink-0 text-white/35">{f.city}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-2.5 py-2 text-[10px] text-white/55">
              <span>{cs ? "1 test otevřený" : "1 test open"}</span>
              <span>
                {introLabel} → {monthlyLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
