"use client";

import Link from "next/link";
import { menuAccountLinks } from "@/lib/i18n/menu-account";

type Props = {
  locale?: string | null;
  student?: boolean;
  onNavigate?: () => void;
  className?: string;
};

/** Login + subscribe first — same pair HN.cz puts at the top of its menu. */
export function MenuAccountStrip({ locale, student, onNavigate, className }: Props) {
  const links = menuAccountLinks(locale, { student });
  return (
    <div className={className ?? "grid grid-cols-2 gap-1.5"}>
      <Link
        href={links.signInHref}
        onClick={onNavigate}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#021d33] hover:border-[#005B96]/40 hover:text-[#005B96] dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
      >
        {links.signInLabel}
      </Link>
      <Link
        href={links.subscribeHref}
        onClick={onNavigate}
        className="rounded-lg bg-[#005B96] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#004a7a]"
      >
        {links.subscribeLabel}
      </Link>
    </div>
  );
}
