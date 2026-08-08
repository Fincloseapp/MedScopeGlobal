"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, Wand2, ClipboardCheck, Clock3, Stethoscope, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOKSCOPE } from "@/lib/lekari/dokumentace/branding";

type StepId = "nahrat" | "zpracovat" | "zkontrolovat";

const STEPS: {
  id: StepId;
  label: string;
  title: string;
  benefit: string;
  icon: typeof Mic;
}[] = [
  {
    id: "nahrat",
    label: "1 · Nahrát",
    title: "Mluvte — nestůjte u klávesnice",
    benefit: "Po vyšetření stačí krátký diktát nebo nahrávka konzultace.",
    icon: Mic,
  },
  {
    id: "zpracovat",
    label: "2 · Zpracovat",
    title: "AI připraví strukturu zápisu",
    benefit: "Místo přepisování dostanete návrh připravený pro českou ordinaci.",
    icon: Wand2,
  },
  {
    id: "zkontrolovat",
    label: "3 · Schválit",
    title: "Vy rozhodnete o finálním znění",
    benefit: "Upravíte, zkopírujete do NIS — odpovědnost zůstává u lékaře.",
    icon: ClipboardCheck,
  },
];

/** Teaser snippet — deliberately incomplete / redacted for competitive safety */
const TEASER_LINES = [
  { label: "Subj.", text: "Pacient popisuje únavu trvající …", blur: false },
  { label: "Obj.", text: "TK ·····  · TF ·····  · SpO₂ ·····", blur: true },
  { label: "Hodn.", text: "Pracovní diagnóza upravena dle …", blur: false },
  { label: "Plán", text: "Kontrola · medikace · poučení …", blur: true },
];

export function DokumentaceTutorial({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const [step, setStep] = useState<StepId>("nahrat");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const order: StepId[] = ["nahrat", "zpracovat", "zkontrolovat"];
    const id = window.setInterval(() => {
      setStep((prev) => {
        const i = order.indexOf(prev);
        return order[(i + 1) % order.length];
      });
      setPulse((p) => p + 1);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const active = STEPS.find((s) => s.id === step) ?? STEPS[0];
  const ActiveIcon = active.icon;

  return (
    <section
      className={
        variant === "compact"
          ? "rounded-3xl border border-[#cfe1f3] bg-white p-5 sm:p-6"
          : "relative overflow-hidden rounded-3xl border border-[#cfe1f3] bg-white shadow-sm"
      }
      aria-label={`Ukázka ${DOKSCOPE.fullName}`}
    >
      {variant === "full" ? (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(0,91,150,0.08),transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(2,29,51,0.06),transparent_40%)]"
          aria-hidden
        />
      ) : null}

      <div className={`relative ${variant === "full" ? "p-6 sm:p-8 lg:p-10" : ""}`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              Jak to funguje · 60 sekund
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#021d33] sm:text-3xl">
              Od hlasu k zápisu — bez večerního přepisování
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tři kroky, které šetří čas v ordinaci. Ukázka je záměrně zjednodušená —
              plné šablony a nastavení jsou až uvnitř aplikace pro ověřené lékaře.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6fb] px-3 py-1.5 text-xs font-medium text-[#005B96]">
            <Clock3 className="h-3.5 w-3.5" />
            Méně administrativy · více času na pacienta
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s) => {
            const on = s.id === step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  on
                    ? "bg-[#005B96] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          {/* Phone / app mock */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#0a4a78]/40 bg-[#021d33] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/80">
                    {DOKSCOPE.provider}
                  </p>
                  <p className="text-sm font-semibold text-white">{DOKSCOPE.shortName}</p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium text-emerald-100">
                  Ukázka
                </span>
              </div>

              <div className="min-h-[320px] bg-gradient-to-b from-[#043a63] to-[#021d33] p-4 sm:min-h-[360px]">
                {step === "nahrat" ? (
                  <div key={`n-${pulse}`} className="dok-tut-fade flex h-full flex-col items-center justify-center gap-4">
                    <div className="relative flex h-28 w-28 items-center justify-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/20" />
                      <span className="absolute inset-3 rounded-full bg-sky-400/15" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#005B96] shadow-lg">
                        <Mic className="h-7 w-7" />
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium text-white">
                      Nahrávám diktát…
                    </p>
                    <div className="flex h-8 items-end gap-1">
                      {[4, 10, 6, 14, 8, 12, 5, 11, 7].map((h, i) => (
                        <span
                          key={i}
                          className="w-1.5 rounded-full bg-sky-300/80"
                          style={{
                            height: `${h * 2}px`,
                            animation: `dokWave 1.1s ease-in-out ${i * 0.08}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <p className="max-w-[240px] text-center text-xs text-sky-100/75">
                      Konzultace nebo diktát — bez ručního přepisu věty po větě.
                    </p>
                  </div>
                ) : null}

                {step === "zpracovat" ? (
                  <div key={`z-${pulse}`} className="dok-tut-fade flex h-full flex-col justify-center gap-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <Wand2 className="h-5 w-5 text-sky-200" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">Připravuji zápis…</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-2/3 animate-pulse rounded-full bg-sky-300" />
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-xs text-sky-100/85">
                      <li className="rounded-xl bg-white/5 px-3 py-2">✓ Rozpoznání klinického kontextu</li>
                      <li className="rounded-xl bg-white/5 px-3 py-2">✓ Návrh struktury pro ordinaci</li>
                      <li className="rounded-xl bg-white/5 px-3 py-2 text-sky-100/50">
                        · detaily šablon jen v aplikaci
                      </li>
                    </ul>
                    <p className="text-center text-[11px] text-sky-100/60">
                      Interní zpracování nezveřejňujeme — chráníme kvalitu i praxi.
                    </p>
                  </div>
                ) : null}

                {step === "zkontrolovat" ? (
                  <div key={`k-${pulse}`} className="dok-tut-fade flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                        Návrh zápisu
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-100">
                        <Lock className="h-3 w-3" />
                        náhled
                      </span>
                    </div>
                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/95 p-3 text-[#021d33]">
                      {TEASER_LINES.map((line) => (
                        <div key={line.label} className="flex gap-2 text-xs leading-5">
                          <span className="w-10 shrink-0 font-semibold text-[#005B96]">
                            {line.label}
                          </span>
                          <span
                            className={
                              line.blur
                                ? "select-none text-slate-400 blur-[2.5px]"
                                : "text-slate-700"
                            }
                          >
                            {line.text}
                          </span>
                        </div>
                      ))}
                      <p className="border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                        Plné šablony a export — po přihlášení ověřeného lékaře.
                      </p>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <span className="flex-1 rounded-full bg-white/10 py-2 text-center text-xs text-sky-100">
                        Upravit
                      </span>
                      <span className="flex-1 rounded-full bg-white py-2 text-center text-xs font-semibold text-[#021d33]">
                        Schválit
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Copy + benefits */}
          <div className="flex flex-col justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f2f9] text-[#005B96]">
              <ActiveIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-[#021d33] sm:text-2xl">
              {active.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{active.benefit}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e8f4] bg-[#fafcff] p-4">
                <Stethoscope className="h-4 w-4 text-[#005B96]" />
                <p className="mt-2 text-sm font-semibold text-[#021d33]">Pro praxi</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Méně psaní po ambulanci, rychlejší uzavření dokumentace.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d9e8f4] bg-[#fafcff] p-4">
                <Lock className="h-4 w-4 text-[#005B96]" />
                <p className="mt-2 text-sm font-semibold text-[#021d33]">Chráníme know-how</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Veřejná ukázka neobsahuje kompletní šablony ani nastavení AI.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="h-11 rounded-full bg-[#005B96] px-5">
                <Link href="/app/dokumentace">Vyzkoušet v aplikaci</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-[#cfe1f3] px-5 text-[#005B96]"
              >
                <Link
                  href={
                    variant === "compact"
                      ? "/lekari/dokumentace#stahnout"
                      : "#stahnout"
                  }
                >
                  Stáhnout přes QR
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              Přístup a stažení jen pro ověřené lékaře · účet MedScopeGlobal synchronizuje historii · {DOKSCOPE.domain}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dokWave {
          0%, 100% { transform: scaleY(0.45); opacity: 0.65; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes dokTutFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dok-tut-fade { animation: dokTutFade 0.45s ease-out; }
      `}</style>
    </section>
  );
}
