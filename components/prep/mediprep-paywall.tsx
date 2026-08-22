import Link from "next/link";
import { MeDiprepMark } from "@/components/prep/mediprep-mark";
import { MEDIPREP } from "@/lib/prep/branding";
import { MEDIPREP_PAYWALL_COPY, type MeDiprepGateReason } from "@/lib/prep/entitlement";

export function MeDiprepPaywall({
  reason,
  compact = false,
}: {
  reason: MeDiprepGateReason;
  compact?: boolean;
}) {
  const copy = MEDIPREP_PAYWALL_COPY[reason];
  return (
    <aside
      className={
        compact
          ? "rounded-2xl border border-[#A3E635]/30 bg-[#0A192F] p-5 text-white"
          : "mx-4 my-6 rounded-2xl border border-[#A3E635]/30 bg-[#0A192F] p-6 text-white"
      }
      aria-label="Předplatné MeDiprep"
    >
      <div className="flex items-start gap-3">
        <MeDiprepMark size="md" className="shrink-0 rounded-[22%] ring-1 ring-white/25" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">
            {MEDIPREP.lockline}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-sky-50/90">{copy.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/predplatne?trial=1#student"
              className="inline-flex h-10 items-center rounded-full bg-[#22a05a] px-4 text-sm font-semibold text-white hover:bg-[#1b874b]"
            >
              {copy.cta}
            </Link>
            <Link
              href={MEDIPREP.routes.pricingAnchor}
              className="inline-flex h-10 items-center rounded-full border border-white/35 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              Student {MEDIPREP.priceMonthlyCzk} Kč
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
