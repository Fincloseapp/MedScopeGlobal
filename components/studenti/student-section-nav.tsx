import Link from "next/link";
import { STUDENT_CLUB_PLAN_HREF, STUDENT_SECTION_NAV } from "@/lib/studenti/club";

export function StudentSectionNav({ current }: { current?: string }) {
  return (
    <nav className="flex flex-wrap gap-2 text-sm" aria-label="Sekce pro studenty">
      {STUDENT_SECTION_NAV.map((item) => {
        const active = current === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-[#005B96] px-3 py-1.5 font-semibold text-white"
                : "rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 hover:border-[#005B96]/40"
            }
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href={STUDENT_CLUB_PLAN_HREF}
        className="rounded-full border border-[#005B96]/30 px-3 py-1.5 font-semibold text-[#005B96] hover:bg-[#f0f7ff]"
      >
        Členství
      </Link>
    </nav>
  );
}
