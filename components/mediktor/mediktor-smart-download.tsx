"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Smartphone, Apple, Play, Share, MoreVertical, CheckCircle2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediktorMark } from "@/components/lekari/mediktor-mark";
import { InstallAppButton } from "@/components/lekari/dok-app/install-app-button";
import { MediktorPwaRegister } from "@/components/lekari/dok-app/mediktor-pwa-register";
import { detectMediktorPlatform } from "@/components/lekari/dok-app/use-mediktor-pwa";
import { MEDIKTOR } from "@/lib/lekari/dokumentace/branding";
import { MEDIKTOR_ONBOARDING, MEDIKTOR_STORE } from "@/lib/mediktor/copy";

export function MediktorSmartDownload() {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("other");
  const [autoOpen, setAutoOpen] = useState(false);

  const appStoreUrl = MEDIKTOR_STORE.appStoreUrl;
  const playStoreUrl = MEDIKTOR_STORE.playStoreUrl;
  const storesMissing = !appStoreUrl && !playStoreUrl;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const force = params.get("store");
    const detected = detectMediktorPlatform();
    const p =
      force === "ios" || force === "android"
        ? force
        : detected;
    setPlatform(p);
    setAutoOpen(params.get("install") !== "0");

    if (force === "ios" && appStoreUrl) {
      window.location.replace(appStoreUrl);
      return;
    }
    if (force === "android" && playStoreUrl) {
      window.location.replace(playStoreUrl);
    }
  }, [appStoreUrl, playStoreUrl]);

  const steps = useMemo(() => {
    if (platform === "ios") {
      return [
        { icon: Smartphone, text: "Klepněte na zelené tlačítko — otevře se nabídka instalace." },
        { icon: Share, text: "V Safari dole klepněte Sdílet (čtverec se šipkou nahoru)." },
        { icon: CheckCircle2, text: "Zvolte „Přidat na plochu“ → Přidat. Ikona MeD / MeDiktor bude na ploše." },
      ];
    }
    if (platform === "android") {
      return [
        { icon: Smartphone, text: "Klepněte na zelené tlačítko Nainstalovat MeDiktor." },
        { icon: MoreVertical, text: "Když se dialog neotevře: Chrome ⋮ → „Nainstalovat aplikaci“." },
        { icon: CheckCircle2, text: "Potvrďte. MeDiktor se objeví mezi aplikacemi s ikonou MeD." },
      ];
    }
    return [
      { icon: Monitor, text: "Na tomto počítači klepněte na „Nainstalovat MeDiktor na plochu“." },
      { icon: MoreVertical, text: "Chrome/Edge: v adresním řádku ikona ⊕ / počítač, nebo … → Aplikace → Instalovat." },
      { icon: CheckCircle2, text: "Aplikace se objeví v nabídce Start. Připněte ji na plochu: pravý klik → Připnout na plochu." },
    ];
  }, [platform]);

  return (
    <div className="min-h-[70vh] bg-[#f7fbff]">
      <MediktorPwaRegister />
      <section className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <MediktorMark size="lg" className="rounded-[22%]" priority />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#005B96]">
                {MEDIKTOR.provider}
              </p>
              <h1 className="font-display text-2xl font-bold text-[#021d33]">
                Instalace {MEDIKTOR.shortName}
              </h1>
              <p className="text-sm font-medium text-[#005B96]">Ikona MeD na ploše telefonu i PC</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {MEDIKTOR_ONBOARDING.marketing.startIn30}{" "}
            {MEDIKTOR_ONBOARDING.marketing.otpBlurb}
          </p>

          {storesMissing ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-950">
              <p className="font-semibold">Instalace na plochu (PWA) — telefon i počítač.</p>
              <p className="mt-1">
                App Store a Google Play ještě nejsou. MeDiktor nainstalujete z prohlížeče:
                ikona <strong>MeD</strong> se objeví na ploše / v nabídce Start jako běžná aplikace.
              </p>
            </div>
          ) : null}

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
            <InstallAppButton variant="hero" autoOpen={autoOpen} />
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href="/app/dokumentace?install=1&source=smart-download">
                Otevřít MeDiktor v prohlížeči
              </Link>
            </Button>
            {appStoreUrl ? (
              <Button asChild variant="outline" className="h-11 rounded-full">
                <a href={appStoreUrl}>
                  <Apple className="mr-2 h-4 w-4" />
                  App Store
                </a>
              </Button>
            ) : null}
            {playStoreUrl ? (
              <Button asChild variant="outline" className="h-11 rounded-full">
                <a href={playStoreUrl}>
                  <Play className="mr-2 h-4 w-4" />
                  Google Play
                </a>
              </Button>
            ) : null}
            <Button asChild variant="ghost" className="h-10 rounded-full text-[#005B96]">
              <Link href="/mediktor/navod">Návod pro lékaře</Link>
            </Button>
            <Button asChild variant="ghost" className="h-10 rounded-full text-[#005B96]">
              <Link href="/mediktor">Zpět na MeDiktor</Link>
            </Button>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            Detekce:{" "}
            {platform === "ios"
              ? "iPhone / iPad"
              : platform === "android"
                ? "Android"
                : "Počítač — instalace na tuto plochu"}{" "}
            · Podpora {MEDIKTOR.supportPhone}
          </p>
        </div>
      </section>
    </div>
  );
}
