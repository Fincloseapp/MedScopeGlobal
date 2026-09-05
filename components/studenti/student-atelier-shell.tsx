import type { ReactNode } from "react";
import { StudentSectionNav } from "@/components/studenti/student-section-nav";

export function StudentAtelierShell({
  kicker,
  title,
  lead,
  children,
  actions,
  current,
}: {
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
  actions?: ReactNode;
  current?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f3eee6] text-[#1b1712]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <header className="border-b border-[#1b1712]/10 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6d32]">{kicker}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-7 text-[#1b1712]/68">{lead}</p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </header>
        <div className="mt-6">
          <StudentSectionNav current={current} />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export function atelierPrimaryLink(className = "") {
  return `inline-flex items-center justify-center rounded-full bg-[#1b1712] px-5 py-2.5 text-sm font-semibold text-[#f6f1e8] hover:bg-[#2a241c] ${className}`;
}

export function atelierGhostLink(className = "") {
  return `inline-flex items-center justify-center rounded-full border border-[#1b1712]/18 px-5 py-2.5 text-sm font-semibold text-[#1b1712] hover:bg-white/70 ${className}`;
}
