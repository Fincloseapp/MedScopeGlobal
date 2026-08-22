"use client";

import Link from "next/link";
import { upgradeCtaCs, type MeDipacientFeature } from "@/lib/medipacient/entitlement";

export function PlanUpgradeCard({
  feature,
  className = "",
}: {
  feature?: MeDipacientFeature;
  className?: string;
}) {
  const copy = upgradeCtaCs(feature);
  return (
    <section
      className={`rounded-2xl border-2 border-[#2D7FF9]/40 bg-white p-4 ${className}`}
      aria-label={copy.title}
    >
      <p className="text-xl font-semibold text-[#021d33]">{copy.title}</p>
      <p className="mt-2 text-lg leading-7 text-slate-800">{copy.body}</p>
      <Link
        href={copy.href}
        className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#2D7FF9] px-4 text-lg font-semibold text-white hover:bg-[#1f6ae0]"
      >
        Odemknout v Předplatném
      </Link>
      <p className="mt-2 text-base leading-6 text-slate-700">
        Stejný účet MedScopeGlobal. MeDipacient není zdravotnický prostředek.
      </p>
    </section>
  );
}
