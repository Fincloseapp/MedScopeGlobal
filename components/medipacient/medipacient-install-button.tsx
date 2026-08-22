"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Monitor, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeDipacientMark } from "@/components/medipacient/medipacient-mark";
import { MEDIPACIENT } from "@/lib/medipacient/branding";
import {
  promptMeDipacientInstall,
  useMeDipacientPwa,
  type MeDipacientPlatform,
} from "@/components/medipacient/use-medipacient-pwa";

function stepsFor(platform: MeDipacientPlatform): { title: string; items: string[] } {
  if (platform === "ios") {
    return {
      title: "iPhone / iPad (Safari)",
      items: [
        "Otevřete tuto stránku v Safari (ne v Chrome).",
        "Dole klepněte na Sdílet (čtverec se šipkou nahoru).",
        "Zvolte „Přidat na plochu“ → Přidat.",
        "Na ploše se objeví ikona MeDipacient s křížem.",
      ],
    };
  }
  if (platform === "android") {
    return {
      title: "Android (Chrome)",
      items: [
        "Klepněte na „Nainstalovat MeDipacient“.",
        "Pokud se dialog neotevře: menu ⋮ → „Nainstalovat aplikaci“ / „Přidat na plochu“.",
        "Potvrďte. Ikona MeDipacient se objeví mezi aplikacemi.",
      ],
    };
  }
  return {
    title: "Počítač (Chrome nebo Edge)",
    items: [
      "Klepněte na „Nainstalovat MeDipacient“ — prohlížeč nabídne instalaci.",
      "Když se okno neotevře: v adresním řádku vpravo ikona ⊕ / počítač → Instalovat MeDipacient.",
      "Edge: nabídka … → Aplikace → Instalovat tento web jako aplikaci.",
      "Aplikace se objeví v nabídce Start. Připněte ji na plochu pravým klikem → Připnout na plochu.",
    ],
  };
}

export function MeDipacientInstallButton({
  className,
  variant = "header",
  autoOpen = false,
  tone = "auto",
}: {
  className?: string;
  variant?: "header" | "hero";
  /** Open the install sheet on mount (used with ?install=1). */
  autoOpen?: boolean;
  /** Light = white helper text (dark hero). */
  tone?: "auto" | "light" | "dark";
}) {
  const { installed, canPrompt, platform } = useMeDipacientPwa();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const guide = stepsFor(platform);

  useEffect(() => {
    if (!autoOpen || installed) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, [autoOpen, installed]);

  async function onInstallClick() {
    setBusy(true);
    const result = await promptMeDipacientInstall();
    setBusy(false);
    if (result === "accepted") {
      setOpen(false);
      return;
    }
    setOpen(true);
  }

  if (installed) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-200 ${className ?? ""}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        MeDipacient je nainstalovaný
      </div>
    );
  }

  const hero = variant === "hero";

  return (
    <>
      <div className={`flex flex-col ${hero ? "items-stretch" : "items-end"} gap-1 ${className ?? ""}`}>
        <Button
          type="button"
          size={hero ? "lg" : "sm"}
          onClick={() => void onInstallClick()}
          className={
            hero
              ? "h-12 w-full rounded-full bg-[#2D7FF9] px-6 text-base font-semibold text-white hover:bg-[#1f6ae0]"
              : "h-8 rounded-full bg-white px-3 text-xs font-semibold text-[#021d33] hover:bg-sky-50"
          }
        >
          <Download className={hero ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5"} />
          {hero ? "Nainstalovat MeDipacient na plochu" : "Stáhnout aplikaci"}
        </Button>
        {hero ? (
          <p
            className={`text-center text-[11px] ${
              tone === "light" ? "text-sky-100/85" : "text-slate-500"
            }`}
          >
            {platform === "desktop"
              ? "Chrome / Edge — ikona MeDipacient se objeví v nabídce Start a na ploše."
              : platform === "ios"
                ? "Safari: Sdílet → Přidat na plochu."
                : "Chrome: menu → Nainstalovat aplikaci."}
          </p>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="medipacient-install-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 text-[#021d33] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <MeDipacientMark size="md" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D7FF9]">
                    {MEDIPACIENT.provider}
                  </p>
                  <h2 id="medipacient-install-title" className="font-display text-lg font-bold">
                    Nainstalovat {MEDIPACIENT.shortName}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ikona <strong>MeDipacient</strong> se má objevit na ploše telefonu i počítače —
              nejde o stažení ze store, ale o instalaci webové aplikace.
            </p>

            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#2D7FF9]">
              {platform === "desktop" ? (
                <Monitor className="h-4 w-4" />
              ) : platform === "ios" ? (
                <Share className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              {guide.title}
            </p>
            <ol className="mt-2 space-y-2">
              {guide.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-5 text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2D7FF9] text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>

            {canPrompt ? (
              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-full bg-[#2D7FF9] hover:bg-[#1f6ae0]"
                disabled={busy}
                onClick={() => void onInstallClick()}
              >
                <Download className="mr-2 h-4 w-4" />
                {busy ? "Otevírám instalaci…" : "Nainstalovat MeDipacient"}
              </Button>
            ) : (
              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-full bg-[#021d33] hover:bg-[#032844]"
                onClick={() => setOpen(false)}
              >
                Rozumím — dokončím v prohlížeči
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
