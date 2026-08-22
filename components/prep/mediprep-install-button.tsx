"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Monitor, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeDiprepMark } from "@/components/prep/mediprep-mark";
import { MEDIPREP } from "@/lib/prep/branding";
import {
  ensureMeDiprepServiceWorker,
  promptMeDiprepInstall,
  useMeDiprepPwa,
  type MeDiprepPlatform,
} from "@/components/prep/use-mediprep-pwa";

function stepsFor(platform: MeDiprepPlatform): { title: string; items: string[] } {
  if (platform === "ios") {
    return {
      title: "iPhone / iPad (Safari)",
      items: [
        "Otevřete tuto stránku v Safari (ne v Chrome).",
        "Dole klepněte na Sdílet (čtverec se šipkou nahoru).",
        "Zvolte „Přidat na plochu“ → Přidat.",
        "Na ploše se objeví ikona MeDiprep.",
      ],
    };
  }
  if (platform === "android") {
    return {
      title: "Android (Chrome)",
      items: [
        "Klepněte na „Nainstalovat MeDiprep“.",
        "Pokud se dialog neotevře: menu ⋮ → „Nainstalovat aplikaci“ / „Přidat na plochu“.",
        "Potvrďte. Ikona MeDiprep se objeví mezi aplikacemi.",
      ],
    };
  }
  return {
    title: "Počítač (Chrome nebo Edge)",
    items: [
      "Klepněte na „Nainstalovat MeDiprep“ — prohlížeč nabídne instalaci.",
      "Když se okno neotevře: v adresním řádku vpravo ikona ⊕ / počítač → Instalovat MeDiprep.",
      "Edge: nabídka … → Aplikace → Instalovat tento web jako aplikaci.",
      "Aplikace se objeví v nabídce Start. Připněte ji na plochu pravým klikem → Připnout na plochu.",
    ],
  };
}

export function MeDiprepInstallButton({
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
  const { installed, canPrompt, platform } = useMeDiprepPwa();
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
    const result = await promptMeDiprepInstall();
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
        MeDiprep je nainstalovaný
      </div>
    );
  }

  const hero = variant === "hero";

  return (
    <>
      <div className={`flex flex-col ${hero ? "items-stretch" : "items-end"} gap-1`}>
        <Button
          type="button"
          size={hero ? "lg" : "sm"}
          onClick={() => void onInstallClick()}
          className={
            hero
              ? `h-12 w-full rounded-full bg-[#22a05a] px-6 text-base font-semibold text-white hover:bg-[#1b874b] ${className ?? ""}`
              : `h-8 rounded-full bg-white px-3 text-xs font-semibold text-[#0A192F] hover:bg-sky-50 ${className ?? ""}`
          }
        >
          <Download className={hero ? "mr-2 h-4 w-4" : "mr-1.5 h-3.5 w-3.5"} />
          {hero ? "Nainstalovat MeDiprep na plochu" : "Stáhnout aplikaci"}
        </Button>
        {hero ? (
          <p
            className={`text-center text-[11px] ${
              tone === "light" ? "text-sky-100/85" : "text-slate-500"
            }`}
          >
            {platform === "desktop"
              ? "Chrome / Edge — ikona MeDiprep se objeví v nabídce Start a na ploše."
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
          aria-labelledby="mediprep-install-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 text-[#0A192F] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <MeDiprepMark size="md" className="rounded-[22%]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
                    {MEDIPREP.provider}
                  </p>
                  <h2 id="mediprep-install-title" className="font-display text-lg font-bold">
                    Nainstalovat {MEDIPREP.shortName}
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
              Ikona <strong>MeDiprep</strong> se má objevit na ploše telefonu i počítače — nejde o
              stažení ze store, ale o instalaci webové aplikace.
            </p>

            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#005B96]">
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
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#005B96] text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>

            {canPrompt ? (
              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-full bg-[#22a05a] hover:bg-[#1b874b]"
                disabled={busy}
                onClick={() => void onInstallClick()}
              >
                <Download className="mr-2 h-4 w-4" />
                {busy ? "Otevírám instalaci…" : "Nainstalovat MeDiprep"}
              </Button>
            ) : (
              <Button
                type="button"
                className="mt-5 h-11 w-full rounded-full bg-[#005B96] hover:bg-[#004a7a]"
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

/** Registers the MeDiprep service worker on marketing + download pages so the PWA is installable. */
export function MeDiprepPwaRegister() {
  useEffect(() => {
    void ensureMeDiprepServiceWorker();
  }, []);
  return null;
}

/** Kept so existing imports compile. MeDiktor has no Safari bounce banner. */
export function MeDiprepSafariBanner() {
  return null;
}
