"use client";

import Link from "next/link";
import {
  Mic,
  Layers,
  FileOutput,
  Wrench,
  Shield,
  type LucideIcon,
} from "lucide-react";
import {
  MEDIKTOR_PHYSICIAN_GUIDE,
  MEDIKTOR_WORKSPACE_TIPS,
} from "@/lib/lekari/dokumentace/physician-guide";

const STEP_ICONS: LucideIcon[] = [Mic, Layers, Mic, FileOutput];

type GuideVariant = "app" | "compact";

type MediktorPhysicianGuideProps = {
  variant?: GuideVariant;
};

export function MediktorPhysicianGuide({ variant = "app" }: MediktorPhysicianGuideProps) {
  const g = MEDIKTOR_PHYSICIAN_GUIDE;
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "space-y-4"
          : "mx-auto w-full max-w-3xl space-y-4 px-3 pb-4 pt-2 sm:px-4"
      }
    >
      <div>
        <h2 className="text-base font-semibold text-[#021d33]">{g.title}</h2>
        <p className="mt-1 text-xs text-slate-500">{g.subtitle}</p>
      </div>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#005B96]">
          {g.quickStart.title}
        </h3>
        <ol className="mt-3 space-y-3">
          {g.quickStart.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Mic;
            return (
              <li
                key={step.id}
                className="flex gap-3 rounded-2xl border border-[#cfe1f3] bg-white p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f2f9] text-[#005B96]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#021d33]">{step.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {!isCompact ? (
        <>
          <section className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#021d33]">{g.modes.title}</h3>
            <ul className="mt-3 space-y-3">
              {g.modes.items.map((item) => (
                <li key={item.id}>
                  <p className="text-sm font-medium text-[#021d33]">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <h3 className="text-sm font-semibold text-[#021d33]">{g.templates.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{g.templates.intro}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {g.templates.examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#021d33]">
              <FileOutput className="h-4 w-4 text-[#005B96]" />
              {g.export.title}
            </h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
              {g.export.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <section className="rounded-2xl border border-[#d9e8f4] bg-[#f4f9fc] p-4 text-xs leading-5 text-slate-600">
        <h3 className="flex items-center gap-2 font-semibold text-[#021d33]">
          <Wrench className="h-4 w-4 text-[#005B96]" />
          {g.troubleshooting.title}
        </h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          {g.troubleshooting.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 className="mt-4 flex items-center gap-2 font-semibold text-[#021d33]">
          <Shield className="h-4 w-4 text-[#005B96]" />
          {g.legal.title}
        </h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-4">
          {g.legal.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3">
          {g.legal.marketingLink.label}:{" "}
          <Link
            href={g.legal.marketingLink.href}
            className="font-medium text-[#005B96] underline"
          >
            {g.legal.marketingLink.href}
          </Link>
        </p>
      </section>
    </div>
  );
}

type MediktorWorkspaceTipsProps = {
  tips?: typeof MEDIKTOR_WORKSPACE_TIPS;
};

export function MediktorWorkspaceTips({ tips = MEDIKTOR_WORKSPACE_TIPS }: MediktorWorkspaceTipsProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tips.map((tip) => (
        <div
          key={tip.id}
          className="rounded-xl border border-[#d9e8f4] bg-[#f8fbfd] px-3 py-2.5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#005B96]">
            {tip.title}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">{tip.text}</p>
        </div>
      ))}
    </div>
  );
}
