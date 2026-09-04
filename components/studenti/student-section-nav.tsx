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
                ? "rounded-full bg-[#14110e] px-3 py-1.5 font-semibold text-[#f6f1e8]"
                : "rounded-full border border-[#1b1712]/15 px-3 py-1.5 text-[#1b1712] hover:border-[#8a6d32]"
            }
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href={STUDENT_CLUB_PLAN_HREF}
        className="rounded-full border border-[#8a6d32]/40 px-3 py-1.5 font-semibold text-[#8a6d32] hover:bg-[#8a6d32]/10"
      >
        Student tarif
      </Link>
    </nav>
  );
}
