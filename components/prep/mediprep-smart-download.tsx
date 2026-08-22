"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Smartphone, Share, MoreVertical, CheckCircle2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeDiprepMark } from "@/components/prep/mediprep-mark";
import { MeDiprepInstallButton, MeDiprepPwaRegister } from "@/components/prep/mediprep-install-button";
import { detectMeDiprepPlatform } from "@/components/prep/use-mediprep-pwa";
import { MEDIPREP, MEDIPREP_ONBOARDING } from "@/lib/prep/branding";
import { MeDiprepQrs } from "@/components/prep/mediprep-qrs";

export function MeDiprepSmartDownload() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("other");
  const [autoOpen, setAutoOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPlatform(detectMeDiprepPlatform());
    setAutoOpen(params.get("install") !== "0");
  }, []);

  const steps = useMemo(() => {
    if (platform === "ios") {
      return [
        { icon: Smartphone, text: "Klepněte na zelené tlačítko — otevře se nabídka instalace." },
        { icon: Share, text: "V Safari dole klepněte Sdílet (čtverec se šipkou nahoru)." },
        { icon: CheckCircle2, text: "Zvolte „Přidat na plochu“ → Přidat. Ikona MeDiprep bude na ploše." },
      ];
    }
    if (platform === "android") {
      return [
        { icon: Smartphone, text: "Klepněte na zelené tlačítko Nainstalovat MeDiprep." },
        { icon: MoreVertical, text: "Když se dialog neotevře: Chrome ⋮ → „Nainstalovat aplikaci“." },
        { icon: CheckCircle2, text: "Potvrďte. MeDiprep se objeví mezi aplikacemi." },
      ];
    }
    return [
      { icon: Monitor, text: "Na tomto počítači klepněte na „Nainstalovat MeDiprep na plochu“." },
      { icon: MoreVertical, text: "Chrome/Edge: v adresním řádku ikona ⊕ / počítač, nebo … → Aplikace → Instalovat." },
      { icon: CheckCircle2, text: "Aplikace se objeví v nabídce Start. Připněte ji na plochu: pravý klik → Připnout na plochu." },
    ];
  }, [platform]);

  return (
    <div className="min-h-[70vh] bg-[#F4F7FB]">
      <MeDiprepPwaRegister />
      <section className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#0A192F]/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <MeDiprepMark size="lg" className="rounded-[22%]" priority />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                {MEDIPREP.provider}
              </p>
              <h1 className="font-display text-2xl font-bold text-[#0A192F]">
                Instalace {MEDIPREP.shortName}
              </h1>
              <p className="text-sm font-medium text-[#005B96]">Ikona MeDiprep na ploše telefonu i PC</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {MEDIPREP_ONBOARDING.marketing.otpBlurb}
          </p>

          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-950">
            <p className="font-semibold">Instalace na plochu (PWA) — telefon i počítač.</p>
            <p className="mt-1">
              App Store a Google Play ještě nejsou. MeDiprep nainstalujete z prohlížeče: ikona se objeví
              na ploše / v nabídce Start jako běžná aplikace.
            </p>
          </div>

          <ol className="mt-5 space-y-3">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-[#e3eef7] bg-[#fafcff] px-3 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#005B96] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <s.icon className="mb-1 h-3.5 w-3.5 text-[#005B96]" aria-hidden />
                  <p className="text-xs leading-5 text-slate-700">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-2">
            <MeDiprepInstallButton variant="hero" autoOpen={autoOpen} />
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`${MEDIPREP.routes.app}?install=1&source=smart-download`}>
                Otevřít MeDiprep v prohlížeči
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-10 rounded-full text-[#005B96]">
              <Link href="/mediprep/navod">Návod</Link>
            </Button>
            <Button asChild variant="ghost" className="h-10 rounded-full text-[#005B96]">
              <Link href="/mediprep">Zpět na MeDiprep</Link>
            </Button>
          </div>

          <div className="mt-8">
            <MeDiprepQrs />
          </div>
        </div>
      </section>
    </div>
  );
}
