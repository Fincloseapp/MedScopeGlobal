"use client";

import { useEffect, useState } from "react";
import { Camera, Clock3, Languages } from "lucide-react";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import {
  MP_ONBOARDING_DONE,
  MP_ONBOARDING_NEXT,
  MP_ONBOARDING_SKIP,
  MP_ONBOARDING_STEPS,
  MP_ONBOARDING_TITLE,
} from "@/lib/medipacient/onboarding";

const ICONS = [Camera, Languages, Clock3] as const;

export function MeDipacientOnboarding({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const last = step >= MP_ONBOARDING_STEPS.length - 1;
  const current = MP_ONBOARDING_STEPS[step];
  const Icon = ICONS[step] ?? Camera;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mp-onboarding-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-5 text-[#021d33] shadow-2xl sm:p-6">
        <div className="flex items-center gap-3">
          <MeDipacientMark size="sm" className="shrink-0 rounded-[22%]" />
          <p id="mp-onboarding-title" className="text-xl font-semibold leading-tight">
            {MP_ONBOARDING_TITLE}
          </p>
        </div>

        <p className="mt-4 text-base font-medium text-slate-600">
          Krok {step + 1} z {MP_ONBOARDING_STEPS.length}
        </p>

        <div className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-[#F5F7FA] px-4 py-4">
          <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2D7FF9] text-white">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-semibold leading-tight">{current.title}</h2>
            <p className="mt-2 text-lg leading-7 text-slate-800">{current.body}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-1.5" aria-hidden>
          {MP_ONBOARDING_STEPS.map((item, i) => (
            <span
              key={item.id}
              className={`h-2.5 flex-1 rounded-full ${i <= step ? "bg-[#2D7FF9]" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (last) onDismiss();
              else setStep((n) => n + 1);
            }}
            className="min-h-14 w-full rounded-full bg-[#2D7FF9] px-4 text-xl font-semibold text-white hover:bg-[#1f6ae0]"
          >
            {last ? MP_ONBOARDING_DONE : MP_ONBOARDING_NEXT}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-14 w-full rounded-full border-2 border-slate-400 bg-white px-4 text-xl font-semibold"
          >
            {MP_ONBOARDING_SKIP}
          </button>
        </div>
      </div>
    </div>
  );
}
