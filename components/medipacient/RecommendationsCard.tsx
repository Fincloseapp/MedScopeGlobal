"use client";

import type { Recommendation } from "@/lib/medipacient/medicalParserCZ";

const KIND_CS: Record<Recommendation["kind"], string> = {
  imaging: "Vyšetření",
  referral: "Odbornost",
  gp: "Praktický lékař",
  control: "Kontrola",
  other: "Doporučení",
};

export function RecommendationsCard({
  items,
}: {
  items: Recommendation[];
}) {
  if (!items.length) {
    return (
      <section className="mt-4 rounded-2xl border-2 border-dashed border-slate-400 bg-white p-4">
        <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Kam dál</p>
        <p className="mt-2 text-lg leading-7 text-slate-800">
          Doporučení (RTG, neurologie, praktický lékař) ve zprávě nenašli. Zeptejte se lékaře.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border-2 border-slate-300 bg-white p-4">
      <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">Kam dál</p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.target || item.text}`} className="text-xl leading-8">
            <span className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">
              {KIND_CS[item.kind]}
            </span>
            <span className="mt-0.5 block font-semibold text-[#021d33]">
              {item.target ? item.target : item.text}
            </span>
            {item.target ? <span className="block text-lg text-slate-800">{item.text}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
