import type { PrepAttempt, PrepMode } from "@/lib/prep/types";
import { MEDIPREP } from "@/lib/prep/branding";

export const MEDIPREP_FREE_TESTS = 1;

export type MeDiprepGateReason = "sim" | "drill" | "quota";

export function canStartPrepMode(
  mode: PrepMode,
  attempts: PrepAttempt[],
  entitled: boolean
): { ok: true } | { ok: false; reason: MeDiprepGateReason } {
  if (entitled) return { ok: true };
  if (mode === "simulation") return { ok: false, reason: "sim" };
  if (mode === "drill") return { ok: false, reason: "drill" };
  const used = attempts.filter((a) => a.mode === "mini" || a.mode === "learn" || a.mode === "rapid").length;
  if (used >= MEDIPREP_FREE_TESTS && (mode === "mini" || mode === "learn" || mode === "rapid")) {
    return { ok: false, reason: "quota" };
  }
  return { ok: true };
}

export const MEDIPREP_PAYWALL_COPY: Record<
  MeDiprepGateReason,
  { title: string; body: string; cta: string }
> = {
  sim: {
    title: "Simulace fakulty je v předplatném",
    body: `Plný formát 8 českých LF, čas a skóre jako nanečisto. ${MEDIPREP.trialDays} dní zdarma, pak ${MEDIPREP.priceMonthlyCzk} Kč/měsíc.`,
    cta: `${MEDIPREP.trialDays} dní zdarma`,
  },
  drill: {
    title: "Drill mezer je v předplatném",
    body: `První test ukázal slabiny. Neomezený drill a další sady — ${MEDIPREP.trialDays} dní zdarma.`,
    cta: "Odemknout drill",
  },
  quota: {
    title: "Další testy po předplatném",
    body: `První test je zdarma — ať vidíte styl. Simulace, drill i další sady v tarifu Student (${MEDIPREP.priceMonthlyCzk} Kč/měsíc).`,
    cta: `${MEDIPREP.trialDays} dní zdarma`,
  },
};
