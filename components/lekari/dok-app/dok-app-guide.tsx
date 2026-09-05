"use client";

import Link from "next/link";
import { Mic, Sparkles, FileCheck2, Shield } from "lucide-react";
import { getOrdiZapisAppCopy } from "@/lib/i18n/ordizapis-app-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

const STEP_ICONS = [Mic, Sparkles, FileCheck2, Shield] as const;

export function DokAppGuide({ locale }: { locale?: string }) {
  const copy = getOrdiZapisAppCopy(locale);
  const marketingHref = localizePublicHref("/lekari/dokumentace", locale ?? "cs");
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-3 pb-4 pt-2 sm:px-4">
      <div>
        <h2 className="text-base font-semibold text-[#021d33]">{copy.guideTitle}</h2>
        <p className="mt-1 text-xs text-slate-500">{copy.guideLead}</p>
      </div>

      <ol className="space-y-3">
        {copy.guideSteps.map(({ title, text }, index) => {
          const Icon = STEP_ICONS[index] ?? Mic;
          return (
            <li
              key={title}
              className="flex gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f2f9] text-[#005B96]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#021d33]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-[#d9e8f4] bg-[#f4f9fc] p-4 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-[#021d33]">{copy.micHelpTitle}</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          {copy.micHelp.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 font-semibold text-[#021d33]">{copy.legalTitle}</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          {copy.legal.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3">
          {copy.marketing}:{" "}
          <Link href={marketingHref} className="font-medium text-[#005B96] underline">
            {marketingHref}
          </Link>
        </p>
      </div>
    </div>
  );
}
