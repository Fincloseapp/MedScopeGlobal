"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, Share, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia("(display-mode: standalone)");
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return mql.matches || Boolean(nav.standalone);
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallAppButton({
  className,
  gated = false,
  canInstall = true,
}: {
  className?: string;
  /** When true, requires canInstall=true (verified physician). */
  gated?: boolean;
  canInstall?: boolean;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosTip, setIosTip] = useState(false);

  const allowed = !gated || canInstall;

  useEffect(() => {
    setInstalled(isStandalone());
    setIosTip(isIos() && !isStandalone());

    if (!allowed) return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/sw-dokumentace.js", { scope: "/app/dokumentace" })
        .catch(() => {
          // SW optional — app still works online
        });
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [allowed]);

  async function onInstall() {
    if (!allowed) return;
    if (!deferred) {
      setIosTip(true);
      return;
    }
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      // ignore
    }
    setDeferred(null);
  }

  if (installed) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-200 ${className ?? ""}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Aplikace nainstalována
      </div>
    );
  }

  if (!allowed) {
    return (
      <Button
        asChild
        size="sm"
        variant="outline"
        className={`h-8 rounded-full border-white/40 bg-transparent px-3 text-xs text-white hover:bg-white/10 ${className ?? ""}`}
      >
        <Link href="/login?next=/app/dokumentace">
          <Lock className="mr-1.5 h-3.5 w-3.5" />
          Stažení po ověření
        </Link>
      </Button>
    );
  }

  return (
    <div className={`flex flex-col items-end gap-1 ${className ?? ""}`}>
      <Button
        type="button"
        size="sm"
        onClick={() => void onInstall()}
        className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-[#021d33] hover:bg-sky-50"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Stáhnout aplikaci
      </Button>
      {iosTip || (!deferred && isIos()) ? (
        <p className="max-w-[220px] text-right text-[10px] leading-4 text-sky-100/90">
          <Share className="mr-0.5 inline h-3 w-3" />
          iOS: Sdílet → Na plochu
        </p>
      ) : null}
    </div>
  );
}
