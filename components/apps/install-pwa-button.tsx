"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, CheckCircle2, Share, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppProduct } from "@/lib/apps/catalog";

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
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function pathInScope(pathname: string, appPath: string): boolean {
  return pathname === appPath || pathname.startsWith(`${appPath}/`);
}

export function InstallPwaButton({
  app,
  className,
  gated = false,
  canInstall = true,
  loginHref,
  label,
  compact = false,
}: {
  app: AppProduct;
  className?: string;
  gated?: boolean;
  canInstall?: boolean;
  loginHref?: string;
  label?: string;
  compact?: boolean;
}) {
  const pathname = usePathname() || "/";
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const allowed = !gated || canInstall;
  const inScope = pathInScope(pathname, app.appPath);
  const ios = useMemo(() => isIos(), []);
  const android = useMemo(() => isAndroid(), []);

  useEffect(() => {
    setInstalled(isStandalone());
    if (!allowed) return;

    // SW must control the app scope for Chromium installability.
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register(app.serviceWorker, { scope: app.appPath })
        .catch(() => {
          /* SW optional for first paint; install may still work after reload */
        });
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowHelp(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    // Auto-open help when arriving via ?install=1 from marketing pages.
    try {
      const wantsInstall = new URLSearchParams(window.location.search).get("install") === "1";
      if (wantsInstall && !isStandalone()) {
        setShowHelp(true);
      }
    } catch {
      /* ignore */
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [allowed, app.serviceWorker, app.appPath]);

  async function onInstall() {
    if (!allowed) return;

    // Chromium only fires beforeinstallprompt inside manifest scope.
    if (!inScope) {
      window.location.href = `${app.appPath}?install=1&source=download`;
      return;
    }

    if (deferred) {
      await deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {
        /* ignore */
      }
      setDeferred(null);
      return;
    }

    // No native prompt (iOS, or Chrome heuristics) — show platform steps.
    setShowHelp(true);
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
        <Link href={loginHref || `/login?next=${encodeURIComponent(app.appPath)}`}>
          <Lock className="mr-1.5 h-3.5 w-3.5" />
          Stažení po přihlášení
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
        className="h-9 rounded-full bg-white px-3.5 text-xs font-semibold text-[#021d33] hover:bg-sky-50"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        {label || (compact ? "Stáhnout" : `Stáhnout ${app.shortName}`)}
      </Button>

      {showHelp ? (
        <div
          className={`mt-1 max-w-[min(92vw,280px)] rounded-xl border border-white/20 bg-[#0A192F]/95 p-3 text-left text-[11px] leading-4 text-sky-50 shadow-lg ${
            compact ? "" : ""
          }`}
          role="status"
        >
          <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-white">
            <Smartphone className="h-3.5 w-3.5" />
            Jak nainstalovat na mobil
          </p>
          {ios ? (
            <ol className="list-decimal space-y-1 pl-4 text-sky-100/95">
              <li>
                Klepněte na <Share className="mx-0.5 inline h-3 w-3" /> <strong>Sdílet</strong> v Safari
              </li>
              <li>Zvolte <strong>Přidat na plochu</strong></li>
              <li>Potvrďte <strong>Přidat</strong> — ikona {app.shortName} se objeví na ploše</li>
            </ol>
          ) : android ? (
            <ol className="list-decimal space-y-1 pl-4 text-sky-100/95">
              <li>V Chrome otevřete menu <strong>⋮</strong> vpravo nahoře</li>
              <li>Zvolte <strong>Nainstalovat aplikaci</strong> / <strong>Přidat na plochu</strong></li>
              <li>Potvrďte instalaci — {app.shortName} se otevře jako aplikace</li>
            </ol>
          ) : (
            <ol className="list-decimal space-y-1 pl-4 text-sky-100/95">
              <li>Chrome/Edge: ikona <strong>⊕</strong> v adresním řádku, nebo menu → Instalovat</li>
              <li>Nebo otevřete {app.shortName} a klepněte znovu na Stáhnout</li>
            </ol>
          )}
          {!inScope ? (
            <p className="mt-2 text-[10px] text-amber-100/90">
              Instalace probíhá z aplikace — přesměrováváme na {app.appPath}…
            </p>
          ) : null}
          <button
            type="button"
            className="mt-2 text-[10px] font-medium text-sky-200 underline"
            onClick={() => setShowHelp(false)}
          >
            Skrýt tip
          </button>
        </div>
      ) : compact ? null : (
        <p className="max-w-[240px] text-right text-[10px] leading-4 text-sky-100/80">
          {ios
            ? "iPhone: Sdílet → Přidat na plochu"
            : android
              ? "Android: Chrome → Nainstalovat aplikaci"
              : "PC: Chrome/Edge → Nainstalovat aplikaci"}
        </p>
      )}
    </div>
  );
}
